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
import {
  EMPTY,
  exhaustMap,
  map,
  mergeMap,
  of,
  Subject,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { FormControl } from '@angular/forms';

import { Exact, Order, OrderLine } from '@mosaic/common';
import { MosAlertService } from '@mosaic/ui/alert';

import { CartDataService } from '../../../data';
import { Store } from '@ngrx/store';
import { refetchShippingMethods } from '../store';
import { setActiveOrder } from '../../../store';

export type RemoveItemFromCartMutationVariables = Exact<{
  id: number;
}>;

export type RemoveItemFromCartMutation = {
  removeOrderLine: Order | GraphQLError;
};

@Component({
  selector: 'mos-order-line',
  templateUrl: './order-line.component.html',
  styles: [':host { display: flex; width: 100%; --mos-icon-size: 1.25rem}'],
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
    private dataService: CartDataService,
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
          this.dataService.ajustItemQuantity(this.item.id, quantity)
        ),
        mergeMap(({ adjustOrderLine }) => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();

          const { errorCode, message } = adjustOrderLine as any;

          if (errorCode) {
            this.quantity.reset(this.item.quantity, { emitEvent: false });
            return this.alert.open(message).pipe(mergeMap(() => EMPTY));
          }

          return of(adjustOrderLine as Order);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((order: Order) => {
        this.store.dispatch(refetchShippingMethods());
        this.store.dispatch(setActiveOrder({ order }));
      });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public removeItem(id: number) {
    this.dataService
      .removeItem(id)
      .pipe(take(1))
      .subscribe(() => this.store.dispatch(refetchShippingMethods()));
  }
}
