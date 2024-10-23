import { Inject, Injectable, Type } from '@nestjs/common';
import {
  DataSource,
  FindOneOptions,
  FindOptionsRelations,
  In,
  IsNull,
} from 'typeorm';
import mime from 'mime-types';
import { ReadStream } from 'graphql-upload-ts';
import sizeOf from 'image-size';
import path from 'path';
import { camelCase } from 'typeorm/util/StringUtils';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

import {
  notNullOrUndefined,
  InternalServerError,
  MimeTypeError,
  DeletionResult,
  DeletionResponse,
} from '@mosaic/common';

import { Asset, MosaicEntity, DATA_SOURCE_PROVIDER, Product } from '../../data';
import {
  CreateAssetInput,
  ListQueryOptions,
  CreateAssetResult,
} from '../../types';
import { ConfigService } from '../../config';
import { AssetType, PaginatedList, getAssetType } from '../../common';
import { OrderableAsset } from '../../data/';
import { RequestContext } from '../../api';
import { AssetEvent, EventBus } from '../../event-bus';

export interface EntityWithAssets extends MosaicEntity {
  featuredAsset: Asset | null;
  assets: OrderableAsset[];
}

export interface EntityAssetInput {
  assetIds?: number[] | null;
  featuredAssetId?: number | null;
}

function getHostEntityIdProperty(entity: EntityWithAssets): string {
  const entityName = entity.constructor.name;
  return `${camelCase(entityName)}Id`;
}

@Injectable()
export class AssetService {
  private permittedMimeTypes: Array<{ type: string; subtype: string }> = [];

  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private eventBus: EventBus,
    private configService: ConfigService
  ) {
    this.permittedMimeTypes = this.configService.assetOptions.permittedFileTypes
      .map((val) => (/\.[\w]+/.test(val) ? mime.lookup(val) || undefined : val))
      .filter(notNullOrUndefined)
      .map((val) => {
        const [type, subtype] = val.split('/');
        return { type, subtype };
      });
  }

  public async findAll(
    options?: ListQueryOptions<Asset>
  ): Promise<PaginatedList<Asset>> {
    return this.dataSource
      .getRepository(Asset)
      .findAndCount(options)
      .then(([items, totalItems]) => ({
        items,
        totalItems,
      }));
  }

  public async findOne(
    id: number,
    relations?: FindOptionsRelations<Asset>
  ): Promise<Asset | undefined> {
    return this.dataSource
      .getRepository(Asset)
      .findOne({
        relations: relations ?? [],
        where: { id },
      })
      .then((result) => result ?? undefined);
  }

  public async create({ file }: CreateAssetInput): Promise<CreateAssetResult> {
    const { createReadStream, filename, mimetype } = await file;

    return new Promise((resolve, reject) => {
      const stream: ReadStream = createReadStream();

      stream.on('error', (err: unknown) => {
        reject(err);
      });

      this.createAssetInternal(stream, filename, mimetype)
        .then((result: Asset | MimeTypeError) => {
          resolve(result);
        })
        .catch((error) => reject(error));
    });
  }

  public async getFeaturedAsset<T extends Omit<EntityWithAssets, 'assets'>>(
    entity: T
  ): Promise<Asset | undefined> {
    const entityType: Type<T> = Object.getPrototypeOf(entity).constructor;
    const entityWithFeaturedAsset = await this.dataSource
      .getRepository(entityType)
      .findOne({
        where: { id: entity.id },
        relations: {
          featuredAsset: true,
        },
      } as FindOneOptions<T>)
      .then((result) => result ?? undefined);

    return (
      (entityWithFeaturedAsset && entityWithFeaturedAsset.featuredAsset) ||
      undefined
    );
  }

  public async updateFeaturedAsset<T extends EntityWithAssets>(
    entity: T,
    input: EntityAssetInput
  ): Promise<T> {
    const { assetIds, featuredAssetId } = input;
    if (featuredAssetId === null || (assetIds && assetIds.length === 0)) {
      entity.featuredAsset = null;
      return entity;
    }
    if (featuredAssetId === undefined) {
      return entity;
    }
    const featuredAsset = await this.findOne(featuredAssetId);

    if (featuredAsset) {
      entity.featuredAsset = featuredAsset;
    }
    return entity;
  }

  public async updateEntityAssets<T extends EntityWithAssets>(
    entity: T,
    input: EntityAssetInput
  ): Promise<T> {
    if (!entity.id) {
      throw new InternalServerError('error.entity-must-have-an-id');
    }
    const { assetIds } = input;
    if (assetIds && assetIds.length) {
      const assets: Asset[] = await this.dataSource
        .getRepository(Asset)
        .find({ where: { id: In(assetIds) } });

      const sortedAssets = assetIds
        .map((assetId: number) =>
          assets.find(({ id }: Asset) => id === assetId)
        )
        .filter(notNullOrUndefined);

      await this.removeExistingOrderableAssets(entity);

      entity.assets = await this.createOrderableAssets(entity, sortedAssets);
    } else if (assetIds && assetIds.length === 0) {
      await this.removeExistingOrderableAssets(entity);
    }
    return entity;
  }

  public async getEntityAssets<T extends EntityWithAssets>(
    entity: T
  ): Promise<Asset[] | undefined> {
    let orderableAssets = entity.assets;

    if (!orderableAssets) {
      const entityType: Type<EntityWithAssets> =
        Object.getPrototypeOf(entity).constructor;
      const entityWithAssets = await this.dataSource
        .getRepository(entityType)
        .findOne({
          where: { id: entity.id },
          relations: ['assets', 'assets.asset'],
        });

      orderableAssets = entityWithAssets?.assets ?? [];
    } else if (orderableAssets.length) {
      const assets = await this.dataSource.getRepository(Asset).find({
        where: { id: In(orderableAssets.map((a) => a.assetId)) },
      });

      orderableAssets = orderableAssets.filter(
        ({ assetId }) => !!assets.find(({ id }) => id === assetId)
      );
    } else {
      orderableAssets = [];
    }
    return orderableAssets
      .sort((a, b) => a.position - b.position)
      .map((a) => a.asset);
  }

  private async createAssetInternal(
    stream: ReadStream,
    filename: string,
    mimetype: string
  ): Promise<Asset | MimeTypeError> {
    const { assetOptions } = this.configService;

    if (!this.validateMimeType(mimetype)) {
      return new MimeTypeError({ fileName: filename, mimeType: mimetype });
    }

    const { assetPreviewStrategy, assetStorageStrategy } = assetOptions;
    const sourceFileName = await this.getSourceFileName(filename);
    const previewFileName = await this.getPreviewFileName(sourceFileName);
    const sourceFileIdentifier = await assetStorageStrategy.writeFileFromStream(
      sourceFileName,
      stream
    );
    const sourceFile = await assetStorageStrategy.readFileToBuffer(
      sourceFileIdentifier
    );
    const preview = await assetPreviewStrategy.generatePreviewImage(
      mimetype,
      sourceFile
    );

    const previewFileIdentifier =
      await assetStorageStrategy.writeFileFromBuffer(previewFileName, preview);
    const type = getAssetType(mimetype);
    const { width, height } = this.getDimensions(
      type === AssetType.IMAGE ? sourceFile : preview
    );
    const asset = new Asset({
      type,
      width,
      height,
      name: path.basename(sourceFileName),
      fileSize: sourceFile.byteLength,
      mimeType: mimetype,
      source: sourceFileIdentifier,
      preview: previewFileIdentifier,
      focalPoint: null,
    });

    return this.dataSource.getRepository(Asset).save(asset);
  }

  /**
   * @description
   * Deletes an Asset after performing checks to ensure that the Asset is not currently in use
   * by a Product, ProductVariant or Collection.
   */
  public async delete(
    ctx: RequestContext,
    ids: number[],
    force = false
  ): Promise<DeletionResponse> {
    const assets = await this.dataSource.getRepository(Asset).find({
      where: { id: In(ids) },
    });
    const usageCount = {
      products: 0,
    };
    for (const asset of assets) {
      const usages = await this.findAssetUsages(ctx, asset);
      usageCount.products += usages.products.length;
    }
    const hasUsages = !!usageCount.products;
    if (hasUsages && !force) {
      return {
        result: DeletionResult.NOT_DELETED,
        message: ctx.translate('message.ASSET-IS-FEATURED', {
          assetCount: assets.length,
          products: usageCount.products,
        }),
      };
    }

    return this.deleteUnconditional(ctx, assets);
  }

  private createOrderableAssets(
    entity: EntityWithAssets,
    assets: Asset[]
  ): Promise<OrderableAsset[]> {
    const orderableAssets = assets.map((asset, i) =>
      this.getOrderableAsset(entity, asset, i)
    );
    return this.dataSource
      .getRepository(orderableAssets[0].constructor)
      .save(orderableAssets);
  }

  private getOrderableAsset(
    entity: EntityWithAssets,
    asset: Asset,
    index: number
  ): OrderableAsset {
    const entityIdProperty = getHostEntityIdProperty(entity);
    const orderableAssetType = this.getOrderableAssetType(entity);

    return new orderableAssetType({
      assetId: asset.id,
      position: index,
      [entityIdProperty]: entity.id,
    });
  }

  private async removeExistingOrderableAssets(entity: EntityWithAssets) {
    const entityIdProperty = getHostEntityIdProperty(entity);
    const orderableAssetType: Type<OrderableAsset> =
      this.getOrderableAssetType(entity);

    await this.dataSource.getRepository(orderableAssetType).delete({
      [entityIdProperty]: entity.id,
    });
  }

  private getOrderableAssetType(
    entity: EntityWithAssets
  ): Type<OrderableAsset> {
    const assetRelation = this.dataSource
      .getRepository(entity.constructor)
      .metadata.relations.find(
        ({ propertyName }: RelationMetadata) => propertyName === 'assets'
      );

    if (!assetRelation || typeof assetRelation.type === 'string') {
      throw new InternalServerError(
        'error.could-not-find-matching-orderable-asset'
      );
    }

    return assetRelation.type as Type<OrderableAsset>;
  }

  private validateMimeType(mimeType: string): boolean {
    const [type, subtype] = mimeType.split('/');
    const typeMatches = this.permittedMimeTypes.filter((t) => t.type === type);

    for (const match of typeMatches) {
      if (match.subtype === subtype || match.subtype === '*') {
        return true;
      }
    }
    return false;
  }

  private async generateUniqueName(
    inputFileName: string,
    generateNameFn: (fileName: string, conflictName?: string) => string
  ): Promise<string> {
    const { assetOptions } = this.configService;
    let outputFileName: string | undefined;
    do {
      outputFileName = generateNameFn(inputFileName, outputFileName);
    } while (
      await assetOptions.assetStorageStrategy.fileExists(outputFileName)
    );
    return outputFileName;
  }

  private async getSourceFileName(fileName: string): Promise<string> {
    const { assetOptions } = this.configService;

    return this.generateUniqueName(fileName, (name, conflict) =>
      assetOptions.assetNamingStrategy.generateSourceFileName(name, conflict)
    );
  }

  private async getPreviewFileName(fileName: string): Promise<string> {
    const { assetOptions } = this.configService;
    return this.generateUniqueName(fileName, (name, conflict) =>
      assetOptions.assetNamingStrategy.generatePreviewFileName(name, conflict)
    );
  }

  private getDimensions(imageFile: Buffer): { width: number; height: number } {
    try {
      const { width, height } = sizeOf(imageFile);
      return { width, height };
    } catch (error) {
      return { width: 0, height: 0 };
    }
  }

  private async findAssetUsages(
    ctx: RequestContext,
    asset: Asset
  ): Promise<{ products: Product[] }> {
    const products = await this.dataSource.getRepository(Product).find({
      where: {
        featuredAsset: { id: asset.id },
        deletedAt: IsNull(),
      },
    });

    return { products };
  }

  /**
   * @description
   * Unconditionally delete given assets.
   * Does not remove assets from channels
   */
  private async deleteUnconditional(
    ctx: RequestContext,
    assets: Asset[]
  ): Promise<DeletionResponse> {
    for (const asset of assets) {
      // Create a new asset so that the id is still available
      // after deletion (the .remove() method sets it to undefined)
      const deletedAsset = new Asset(asset);
      await this.dataSource.getRepository(Asset).remove(asset);

      try {
        await this.configService.assetOptions.assetStorageStrategy.deleteFile(
          asset.source
        );
        await this.configService.assetOptions.assetStorageStrategy.deleteFile(
          asset.preview
        );
      } catch (e: any) {
        //
      }
      await this.eventBus.publish(
        new AssetEvent(ctx, deletedAsset, 'deleted', deletedAsset.id)
      );
    }
    return {
      result: DeletionResult.DELETED,
    };
  }
}
