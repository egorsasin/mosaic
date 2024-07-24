import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GraphQLError } from 'graphql';
import { take } from 'rxjs';

import { Exact, Order, OrderLine } from '@mosaic/common';
import {
  AdjustItemQuantityMutation,
  AdjustItemQuantityMutationVariables,
  DataService,
} from '../../data';
import { ADJUST_ITEM_QUANTITY, REMOVE_ITEM_FROM_CART } from '../order.graphql';

import { CheckoutService } from '../checkout.service';

export type RemoveItemFromCartMutationVariables = Exact<{
  id: number;
}>;

export type RemoveItemFromCartMutation = {
  removeOrderLine: Order | GraphQLError;
};

@Component({
  selector: 'mos-order-line',
  templateUrl: './order-line.component.html',
  styles: [':host { display: flex; width: 100% }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderLineComponent {
  @Input({ required: true }) item!: OrderLine;

  constructor(
    private dataService: DataService,
    private checkoutService: CheckoutService
  ) {}

  public onQuantityChange({ id }: OrderLine, quantity: number) {
    this.dataService
      .mutate<AdjustItemQuantityMutation, AdjustItemQuantityMutationVariables>(
        ADJUST_ITEM_QUANTITY,
        {
          id,
          quantity,
        }
      )
      .pipe(take(1))
      .subscribe(() => this.checkoutService.refetchShippingMethods());
  }

  public removeItem(id: number) {
    this.dataService
      .mutate<RemoveItemFromCartMutation, RemoveItemFromCartMutationVariables>(
        REMOVE_ITEM_FROM_CART,
        {
          id,
        }
      )
      .pipe(take(1))
      .subscribe(() => this.checkoutService.refetchShippingMethods());
  }
}
