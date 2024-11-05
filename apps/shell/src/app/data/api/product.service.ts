import { Injectable } from '@angular/core';

import { Exact } from '@mosaic/common';

import { ProductListQuery } from '../models';
import { DataService } from './data.service';
import { ListOptions } from '../../types';
import { GET_PRODUCT_LIST } from '../definitions';

export interface SearchInput extends ListOptions {
  categorySlug?: string;
}

export type SearchProductsQueryVariables = Exact<{
  input: SearchInput;
}>;

@Injectable()
export class ProductDataService {
  constructor(private dataService: DataService) {}

  public getProducts(input: SearchInput) {
    return this.dataService.query<
      ProductListQuery,
      SearchProductsQueryVariables
    >(GET_PRODUCT_LIST, {
      input,
    });
  }
}
