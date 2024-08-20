import { Injectable } from '@angular/core';

import {
  NumberOperators,
  PaginatedList,
  QueryListArgs,
  SortOrder,
  LogicalOperator,
  Category,
} from '@mosaic/common';

import { BaseDataService } from '../../data';
import { GET_CATEGORY_LIST } from '../definitions';

export type CollectionFilterParameter = {
  id?: NumberOperators;
};

export type CollectionSortParameter = {
  id?: SortOrder;
};

export interface CategoryListOptions {
  take?: number | null;
  skip?: number | null;
  sort?: CollectionSortParameter;
  filter?: CollectionFilterParameter;
  filterOperator?: LogicalOperator;
}

@Injectable()
export class CategoryDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getCollections(options?: CategoryListOptions) {
    return this.baseDataService.query<
      PaginatedList<Category>,
      QueryListArgs<CategoryListOptions>
    >(GET_CATEGORY_LIST, {
      options,
    });
  }
}
