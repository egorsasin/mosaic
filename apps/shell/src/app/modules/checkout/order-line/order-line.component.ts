import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { GraphQLError } from 'graphql';
import { exhaustMap, mergeMap, of, Subject, take, takeUntil, tap } from 'rxjs';
import { FormControl } from '@angular/forms';

import { Exact, Order, OrderLine } from '@mosaic/common';
import { MosAlertService } from '@mosaic/ui/alert';

import {
  AdjustItemQuantityMutation,
  AdjustItemQuantityMutationVariables,
  DataService,
} from '../../../data';
import { CheckoutService } from '../checkout.service';
import { ADJUST_ITEM_QUANTITY, REMOVE_ITEM_FROM_CART } from '../../../common';
import { Store } from '@ngrx/store';
import { refetchShippingMethods } from '../store';

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
export class OrderLineComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) item!: OrderLine;

  public quantity: FormControl<number> = new FormControl<number>(1, {
    nonNullable: true,
  });

  public loading = false;

  private alert = inject(MosAlertService);
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private dataService: DataService,
    private checkoutService: CheckoutService,
    private changeDetectorRef: ChangeDetectorRef,
    private store: Store
  ) {}

  public ngOnChanges({ item }: SimpleChanges): void {
    if (item && item.currentValue?.quantity !== item.previousValue?.quantity) {
      this.quantity.setValue(item.currentValue?.quantity, { emitEvent: false });
    }
  }

  public ngOnInit(): void {
    this.quantity.valueChanges
      .pipe(
        tap(() => {
          this.loading = true;
        }),
        exhaustMap((quantity: number) =>
          this.dataService.mutate<
            AdjustItemQuantityMutation,
            AdjustItemQuantityMutationVariables
          >(ADJUST_ITEM_QUANTITY, {
            id: this.item.id,
            quantity,
          })
        ),
        mergeMap(({ adjustOrderLine }) => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();

          const { errorCode, message } = adjustOrderLine as any;

          if (errorCode) {
            this.quantity.reset(this.item.quantity, { emitEvent: false });
            return this.alert.open(message);
          }

          return of(true);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((result: boolean | void) => {
        if (result) {
          this.store.dispatch(refetchShippingMethods());
        }
      });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
      .subscribe(() => this.store.dispatch(refetchShippingMethods()));
  }
}
