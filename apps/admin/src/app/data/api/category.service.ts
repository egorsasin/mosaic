import { Injectable } from '@angular/core';

import { MutationArgs, pick, QueryListArgs } from '@mosaic/common';

import { BaseDataService } from '../api';
import {
  GET_CATEGORY_FILTERS,
  GET_CATEGORY_LIST,
  UPDATE_CATEGORY,
} from '../definitions';
import { QueryResult } from '../../common/query-result';
import {
  CategoryFiltersResult,
  CategoryListQueryResult,
  CategoryListOptions,
  UpdateCategoryInput,
  UpdateCategoryMutation,
} from '../models';

@Injectable()
export class CategoryDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getCategories(
    options?: CategoryListOptions
  ): QueryResult<CategoryListQueryResult> {
    return this.baseDataService.query<
      CategoryListQueryResult,
      QueryListArgs<CategoryListOptions>
    >(GET_CATEGORY_LIST, {
      options,
    });
  }

  public updateCategory(input: UpdateCategoryInput) {
    return this.baseDataService.mutate<
      UpdateCategoryMutation,
      MutationArgs<any>
    >(UPDATE_CATEGORY, {
      input: pick(input, [
        'id',
        'name',
        'slug',
        'description',
        'isPrivate',
        'filters',
      ]),
    });
  }

  public getCategoryFilters() {
    return this.baseDataService.query<CategoryFiltersResult>(
      GET_CATEGORY_FILTERS
    );
  }
}
