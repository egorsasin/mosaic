import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { SearchInput, SearchResponse, SearchResult } from '@mosaic/common';

import { RequestContext } from '../../../api';
import { Category, DATA_SOURCE_PROVIDER, Product } from '../../../data';

/**
 * Search indexing and full-text search for supported databases. See the various
 * SearchStrategy implementations for db-specific code.
 */
@Injectable()
export class FulltextSearchService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
  ) {}
  /**
   * Perform a fulltext search according to the provided input arguments.
   */
  async search(
    ctx: RequestContext,
    input: SearchInput,
    enabledOnly = false
  ): Promise<Omit<SearchResponse, 'categories'>> {
    const { take = 20, skip = 0 } = input;

    const qb = this.dataSource
      .getRepository(Product)
      .createQueryBuilder('product');

    if (enabledOnly) {
      qb.andWhere('product.enabled = :enabled', { enabled: true });
    }

    if (input.categoryId) {
      qb.innerJoin(
        'product.categories',
        'productCategory',
        'productCategory.id = :categoryId',
        { categoryId: 1 }
      );
    }

    const [items, count] = (await qb
      .limit(take)
      .offset(skip)
      .getManyAndCount()) as any[];

    return {
      items,
      totalItems: count,
    };
  }

  /**
   * Return a list of all Collections which appear in the result set.
   */
  async categories(
    ctx: RequestContext,
    input: SearchInput,
    enabledOnly = false
  ): Promise<{ category: Category; count: number }[]> {
    return [];
  }
}
