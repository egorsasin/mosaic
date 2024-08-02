import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from '../data/data.service';
import { ListOptions } from '../types';

import { ADD_TO_CART, GET_PRODUCT_LIST } from './product.definitions';
import { AddToCart, GetProductList } from './product.types';

@Injectable()
export class ProductService {
  constructor(private dataService: DataService) {}

  public getProducts(options: ListOptions) {
    return this.dataService.query<
      GetProductList.Query,
      GetProductList.Variables
    >(GET_PRODUCT_LIST, {
      options,
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
