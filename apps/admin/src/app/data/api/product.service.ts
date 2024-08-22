import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  MutationArgs,
  PaginatedList,
  Product,
  SearchInput,
} from '@mosaic/common';

import {
  PRODUCT_LIST_QUERY,
  SEARCH_PRODUCTS,
  UPDATE_PRODUCT,
} from '../definitions';
import { BaseDataService } from './base-data.service';

export type SearchProductsQuery = {
  search: PaginatedList<Product>;
};

export type FacetValueFilterInput = {
  and?: number;
  or?: number;
};

@Injectable()
export class ProductDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getProducts(options: any) {
    return this.baseDataService.query<any, any>(PRODUCT_LIST_QUERY, {
      options,
    }) as any;
  }

  public searchProducts(term: string, take = 10, skip = 0) {
    return this.baseDataService.query<
      SearchProductsQuery,
      MutationArgs<SearchInput>
    >(SEARCH_PRODUCTS, {
      input: {
        term,
        take,
        skip,
        groupByProduct: true,
      },
    });
  }

  public updateProduct(product: any): Observable<any> {
    const { id, enabled, slug, description, assetIds, featuredAssetId } =
      product;
    const input = {
      id,
      input: { enabled, slug, description, assetIds, featuredAssetId },
    };

    return this.baseDataService.mutate<any, any>(UPDATE_PRODUCT, input);
  }
}
