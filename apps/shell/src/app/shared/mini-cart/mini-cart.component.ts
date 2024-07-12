import { Component } from '@angular/core';

import { OrderLine } from '@mosaic/common';

import { ActiveOrderService } from '../../active-order';
import { take } from 'rxjs';
import {
  AdjustItemQuantityMutation,
  AdjustItemQuantityMutationVariables,
  DataService,
} from '../../data';
import { ADJUST_ITEM_QUANTITY } from '../../checkout/checkout-process/cart.graphql';

@Component({
  selector: 'mos-mini-cart',
  templateUrl: './mini-cart.component.html',
  styleUrls: ['./mini-cart.component.scss'],
})
export class MiniCartComponent {
  public order$ = this.activeOrderService.activeOrder$;

  constructor(
    private readonly activeOrderService: ActiveOrderService,
    private readonly dataService: DataService
  ) {}

  public removeProduct(): void {
    //
  }

  public onQuantityChange({ product }: OrderLine, quantity: number): void {
    this.dataService
      .mutate<AdjustItemQuantityMutation, AdjustItemQuantityMutationVariables>(
        ADJUST_ITEM_QUANTITY,
        {
          id: product.id,
          quantity,
        }
      )
      .pipe(take(1))
      .subscribe();
  }
}
