import { Inject, Injectable } from '@nestjs/common';

import {
  assertFound,
  ConfigurableOperation,
  ConfigurableOperationDefinition,
  CreateCategoryInput,
  SortOrder,
  UpdateCategoryInput,
} from '@mosaic/common';

import { Category, DATA_SOURCE_PROVIDER, Product } from '../../data';
import { RelationPaths, RequestContext } from '../../api';
import { ListQueryBuilder } from '../helpers/list-query-builder';
import { PaginatedList } from '../../common';
import { ListQueryOptions } from '../../types';
import { ConfigService } from '../../config';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { ConfigArgService } from '../helpers/config-args';
import {
  EventBus,
  CategoryModificationEvent,
  CategoryEvent,
} from '../../event-bus';

const chunkArray = <T>(array: T[], chunkSize = 5000): T[][] => {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }

  return results;
};

@Injectable()
export class CategoryService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private configArgService: ConfigArgService,
    private listQueryBuilder: ListQueryBuilder,
    private configService: ConfigService,
    private eventBus: EventBus
  ) {}

  public async findAll(
    options?: ListQueryOptions<Category>,
    relations?: RelationPaths<Category>
  ): Promise<PaginatedList<Category>> {
    const qb = this.listQueryBuilder.build(Category, options, {
      relations: relations ?? [],
      orderBy: { position: SortOrder.ASC },
    });

    return qb.getManyAndCount().then(async ([items, totalItems]) => {
      return {
        items,
        totalItems,
      };
    });
  }

  public async findOne(
    id: number,
    relations?: RelationPaths<Category>
  ): Promise<Category | undefined> {
    return this.dataSource.getRepository(Category).findOne({
      where: { id },
      relations: relations ?? [],
      loadEagerRelations: true,
    });
  }

  public async findOneBySlug(
    slug: string,
    relations?: RelationPaths<Category>
  ): Promise<Category | undefined> {
    return this.dataSource.getRepository(Category).findOne({
      where: {
        slug,
      },
      relations: relations ?? [],
    });
  }

  /**
   * Returns all configured CategoryFilters, as specified by the {@link CatalogOptions}.
   */
  public getAvailableFilters(): ConfigurableOperationDefinition[] {
    return this.configService.catalogOptions.categoryFilters.map((f) =>
      f.toGraphQlType()
    );
  }

  public async update(ctx: RequestContext, input: any): Promise<Category> {
    //await this.slugValidator.validateSlugs(ctx, input, CollectionTranslation);

    const category = await this.dataSource
      .getRepository(Category)
      .findOne({ where: { id: input.id } });

    if (!category) {
      throw new EntityNotFoundError(Category, { id: input.id });
    }

    const updatedCategory = new Category({
      ...input,
      updatedAt: new Date(),
    });

    updatedCategory.filters = input.filters
      ? this.getCategoryFiltersFromInput(input)
      : [];

    const affectedProductIds = await this.applyCategoryFiltersInternal(
      updatedCategory,
      !input.filters
    );

    await this.dataSource.getRepository(Category).save(updatedCategory);
    await this.eventBus.publish(
      new CategoryModificationEvent(ctx, updatedCategory, affectedProductIds)
    );
    await this.eventBus.publish(
      new CategoryEvent(ctx, updatedCategory, 'updated', input)
    );

    return assertFound(this.findOne(category.id));
  }

  private getCategoryFiltersFromInput(
    input: CreateCategoryInput | UpdateCategoryInput
    // | PreviewCollectionVariantsInput
  ): ConfigurableOperation[] {
    const filters: ConfigurableOperation[] = [];
    if (input.filters) {
      for (const filter of input.filters) {
        filters.push(
          this.configArgService.parseInput('CategoryFilter', filter)
        );
      }
    }
    return filters;
  }

  private async applyCategoryFiltersInternal(
    collection: Category,
    applyToChangedProductOnly = true
  ): Promise<number[]> {
    const masterConnection =
      this.dataSource.createQueryRunner('master').connection;
    const filters = collection.filters || [];
    const { categoryFilters } = this.configService.catalogOptions;

    let filteredQb = masterConnection
      .getRepository(Product)
      .createQueryBuilder('product')
      .select('product.id', 'id')
      .setFindOptions({ loadEagerRelations: false });

    if (filters.length === 0) {
      filteredQb.andWhere('1 = 0');
    }

    for (const filterType of categoryFilters) {
      const filtersOfType = filters.filter(
        (filter: ConfigurableOperation) => filter.code === filterType.code
      );
      if (filtersOfType.length) {
        for (const filter of filtersOfType) {
          filteredQb = filterType.apply(filteredQb, filter.args);
        }
      }
    }

    const existingVariantsQb = masterConnection
      .getRepository(Product)
      .createQueryBuilder('existingProduct')
      .select('existingProduct.id', 'id')
      .setFindOptions({ loadEagerRelations: false })
      .innerJoin(
        'existingProduct.categories',
        'categoriy',
        'categoriy.id = :id',
        {
          id: collection.id,
        }
      );

    const addQb = masterConnection
      .createQueryBuilder()
      .addCommonTableExpression(filteredQb, 'filtered_products')
      .addCommonTableExpression(existingVariantsQb, 'existing_products')
      .select('filtered.id')
      .from('filtered_products', 'filtered')
      .leftJoin('existing_products', 'existing', 'filtered.id = existing.id')
      .where('existing.id IS NULL');

    const removeQb = masterConnection
      .createQueryBuilder()
      .addCommonTableExpression(filteredQb, 'filtered_products')
      .addCommonTableExpression(existingVariantsQb, 'existing_products')
      .select('existing.id')
      .from('existing_products', 'existing')
      .leftJoin('filtered_products', 'filtered', 'filtered.id = existing.id')
      .where('filtered.id IS NULL');

    const [toAddIds, toRemoveIds] = await Promise.all([
      addQb.getRawMany().then((results) => results.map(({ id }) => id)),
      removeQb.getRawMany().then((results) => results.map(({ id }) => id)),
    ]);

    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        const chunkedDeleteIds = chunkArray(toRemoveIds);
        const chunkedAddIds = chunkArray(toAddIds);

        await Promise.all([
          // Delete products that should no longer be in the collection
          ...chunkedDeleteIds.map((chunk) =>
            transactionalEntityManager
              .createQueryBuilder()
              .relation(Category, 'products')
              .of(collection)
              .remove(chunk)
          ),
          // Adding options that should be in the collection
          ...chunkedAddIds.map((chunk) =>
            transactionalEntityManager
              .createQueryBuilder()
              .relation(Category, 'products')
              .of(collection)
              .add(chunk)
          ),
        ]);
      });
    } catch (e) {
      // DO NOTHING
    }

    if (applyToChangedProductOnly) {
      return [...toAddIds, ...toRemoveIds];
    }

    return [
      ...(await existingVariantsQb
        .getRawMany()
        .then((results) => results.map(({ id }) => id))),
      ...toRemoveIds,
    ];
  }
}
