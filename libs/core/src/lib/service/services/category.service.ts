import { Injectable } from '@nestjs/common';

import { SortOrder } from '@mosaic/common';

import { Category } from '../../data';
import { RelationPaths } from '../../api';
import { ListQueryBuilder } from '../helpers';
import { PaginatedList } from '../../common';
import { ListQueryOptions } from '../../types';

@Injectable()
export class CategoryService {
  constructor(private listQueryBuilder: ListQueryBuilder) {}

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
}
