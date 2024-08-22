import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Exact, LogicalOperator, PaginatedList, Product } from '@mosaic/common';

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

export type SearchInput = {
  categoryId?: number;
  categorySlug?: string;
  facetValueFilters?: FacetValueFilterInput[];
  groupByProduct?: boolean;
  skip?: number;
  sort?: number;
  take?: number;
  term?: string;
};

export type SearchProductsQueryVariables = Exact<{
  input: SearchInput;
}>;

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
      SearchProductsQueryVariables
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
