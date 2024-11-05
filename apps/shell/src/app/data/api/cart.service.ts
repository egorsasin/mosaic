import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from './data.service';
import {
  ADD_TO_CART,
  ADJUST_ITEM_QUANTITY,
  REMOVE_ITEM_FROM_CART,
} from '../definitions';
import {
  AddToCartMutation,
  AddToCartMutationVariables,
  RemoveItemFromCartMutation,
  RemoveItemFromCartMutationVariables,
} from '../models';
import {
  AdjustItemQuantityMutation,
  AdjustItemQuantityMutationVariables,
} from '../types';

@Injectable()
export class CartDataService {
  constructor(private dataService: DataService) {}

  public addItemToCart(
    productId: number,
    quantity: number
  ): Observable<AddToCartMutation> {
    return this.dataService.mutate<
      AddToCartMutation,
      AddToCartMutationVariables
    >(ADD_TO_CART, {
      productId,
      quantity,
    });
  }

  public ajustItemQuantity(
    id: number,
    quantity: number
  ): Observable<AdjustItemQuantityMutation> {
    return this.dataService.mutate<
      AdjustItemQuantityMutation,
      AdjustItemQuantityMutationVariables
    >(ADJUST_ITEM_QUANTITY, {
      id,
      quantity,
    });
  }

  public removeItem(id: number): Observable<RemoveItemFromCartMutation> {
    return this.dataService.mutate<
      RemoveItemFromCartMutation,
      RemoveItemFromCartMutationVariables
    >(REMOVE_ITEM_FROM_CART, {
      id,
    });
  }
}
