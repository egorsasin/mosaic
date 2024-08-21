import { Injectable } from '@angular/core';

import { QueryListArgs } from '@mosaic/common';

import { BaseDataService } from '../api';
import { GET_CATEGORY_FILTERS, GET_CATEGORY_LIST } from '../definitions';
import { QueryResult } from '../../common/query-result';
import {
  CategoryFiltersResult,
  CategoryListQueryResult,
  CategoryListOptions,
} from '../models';

@Injectable()
export class CategoryDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getCollections(
    options?: CategoryListOptions
  ): QueryResult<CategoryListQueryResult> {
    return this.baseDataService.query<
      CategoryListQueryResult,
      QueryListArgs<CategoryListOptions>
    >(GET_CATEGORY_LIST, {
      options,
    });
  }

  public getCategoryFilters() {
    return this.baseDataService.query<CategoryFiltersResult>(
      GET_CATEGORY_FILTERS
    );
  }
}
