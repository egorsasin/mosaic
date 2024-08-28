import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Exact } from '@mosaic/common';

import { DataService } from '../data';
import { ListOptions } from '../types';
import { GET_PRODUCT_LIST } from './product.definitions';
import { ADD_TO_CART } from '../common';
import { AddToCart, GetProductList } from './product.types';

export interface SearchInput extends ListOptions {
  categorySlug?: string;
}

export type SearchProductsQueryVariables = Exact<{
  input: SearchInput;
}>;

@Injectable()
export class ProductService {
  constructor(private dataService: DataService) {}

  public getProducts(input: SearchInput) {
    return this.dataService.query<
      GetProductList.Query,
      SearchProductsQueryVariables
    >(GET_PRODUCT_LIST, {
      input,
    });
  }

  public addToCart(productId: number, quantity: number): Observable<any> {
    return this.dataService.mutate<AddToCart.Mutation, AddToCart.Variables>(
      ADD_TO_CART,
      {
        productId,
        quantity,
      }
    );
  }
}
