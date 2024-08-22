import { DataSource, EntityNotFoundError, IsNull } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';

import { unique } from '@mosaic/common';

import { Product, DATA_SOURCE_PROVIDER } from '../../data';
import { PaginatedList } from '../../common';
import {
  CreateProductInput,
  ListQueryOptions,
  UpdateProductInput,
} from '../../types';
import { AssetService } from './asset.service';

const PRODUCT_RELATIONS = ['assets'];

@Injectable()
export class ProductService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private assetService: AssetService
  ) {}

  public async findAll(
    options?: ListQueryOptions<Product>
  ): Promise<PaginatedList<Product>> {
    return this.dataSource
      .getRepository(Product)
      .findAndCount(options)
      .then(async ([items, totalItems]) => ({
        items,
        totalItems,
      }));
  }

  public async findOne(productId: number): Promise<Product | undefined> {
    const effectiveRelations = PRODUCT_RELATIONS;

    return await this.dataSource.getRepository(Product).findOne({
      relations: unique(effectiveRelations),
      where: {
        id: productId,
        deletedAt: IsNull(),
      },
    });
  }

  public async findOneBySlug(slug: string): Promise<Product | undefined> {
    const effectiveRelations = PRODUCT_RELATIONS;
    return await this.dataSource.getRepository(Product).findOne({
      relations: unique(effectiveRelations),
      where: {
        slug,
        deletedAt: IsNull(),
      },
    });
  }

  public async validateSlugs(input: {
    slug: string;
    id?: number;
  }): Promise<string> {
    const queryBuilder = this.dataSource
      .getRepository(Product)
      .createQueryBuilder('product')
      .where('product.slug = :slug', { slug: input.slug });

    if (input.id) {
      queryBuilder.andWhere('product.id != :id', { id: input.id });
    }

    const match = await queryBuilder.getOne();

    if (match) {
      throw new GraphQLError('DUPLICATED_SLUG');
    }

    return input.slug;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const product = new Product(input);

    return await this.dataSource.getRepository(Product).save(product);
  }

  async update(input: UpdateProductInput): Promise<Product> {
    const product = await this.dataSource
      .getRepository(Product)
      .findOne({ where: { id: input.id } });

    if (!product) {
      throw new EntityNotFoundError(Product, { id: input.id });
    }

    const updatedProduct = new Product({ ...input, updatedAt: new Date() });

    await this.assetService.updateFeaturedAsset(updatedProduct, input);
    await this.assetService.updateEntityAssets(updatedProduct, input);

    await this.dataSource.getRepository(Product).save(updatedProduct);

    console.log('__featuredAsset', await this.findOne(updatedProduct.id));

    return this.findOne(updatedProduct.id);
  }
}
