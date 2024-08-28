import { Injectable } from '@angular/core';

import { QueryListArgs } from '@mosaic/common';

import { DataService } from './data.service';
import { QueryResult } from '../query-result';
import { GET_CATEGORY_LIST } from '../definitions';
import { CategoryListOptions, CategoryListQueryResult } from '../models';

@Injectable()
export class CategoryService {
  constructor(private baseDataService: DataService) {}

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
}
