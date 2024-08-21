import { Injectable } from '@nestjs/common';

import { ConfigurableOperationDefinition, SortOrder } from '@mosaic/common';

import { Category } from '../../data';
import { RelationPaths } from '../../api';
import { ListQueryBuilder } from '../helpers';
import { PaginatedList } from '../../common';
import { ListQueryOptions } from '../../types';
import { ConfigService } from '../../config';

@Injectable()
export class CategoryService {
  constructor(
    private listQueryBuilder: ListQueryBuilder,
    private configService: ConfigService
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

  /**
   * Returns all configured CategoryFilters, as specified by the {@link CatalogOptions}.
   */
  public getAvailableFilters(): ConfigurableOperationDefinition[] {
    return this.configService.catalogOptions.categoryFilters.map((f) =>
      f.toGraphQlType()
    );
  }
}
