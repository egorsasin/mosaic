import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GraphQLError } from 'graphql';
import {
  concatMap,
  distinctUntilChanged,
  exhaustMap,
  of,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';

import { Exact, Order, OrderLine } from '@mosaic/common';
import { MosAlertService } from '@mosaic/ui/alert';

import {
  AdjustItemQuantityMutation,
  AdjustItemQuantityMutationVariables,
  DataService,
} from '../../data';
import { ADJUST_ITEM_QUANTITY, REMOVE_ITEM_FROM_CART } from '../order.graphql';

import { CheckoutService } from '../checkout.service';
import { MosQuantitySelectorComponent } from '../../shared';

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
export class OrderLineComponent implements OnInit {
  @Input({ required: true }) item!: OrderLine;

  @ViewChild('quantity', { static: true })
  quantity?: MosQuantitySelectorComponent;

  private alert = inject(MosAlertService);

  constructor(
    private dataService: DataService,
    private checkoutService: CheckoutService
  ) {}

  public ngOnInit(): void {
    this.quantity?.quantityChange
      .pipe(
        exhaustMap((quantity: number) =>
          this.dataService.mutate<
            AdjustItemQuantityMutation,
            AdjustItemQuantityMutationVariables
          >(ADJUST_ITEM_QUANTITY, {
            id: this.item.id,
            quantity,
          })
        ),
        concatMap(({ adjustOrderLine }) => {
          const { errorCode, message } = adjustOrderLine as any;
          return errorCode ? this.alert.open(message) : of(true);
        })
      )
      .subscribe((result: boolean | void) => {
        if (result) {
          this.checkoutService.refetchShippingMethods();
        }
      });
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
