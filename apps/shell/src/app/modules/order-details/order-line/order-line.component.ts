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
import { ADJUST_ITEM_QUANTITY, REMOVE_ITEM_FROM_CART } from '../../../common';
import { Store } from '@ngrx/store';

export type RemoveItemFromCartMutationVariables = Exact<{
  id: number;
}>;

export type RemoveItemFromCartMutation = {
  removeOrderLine: Order | GraphQLError;
};

@Component({
  selector: 'mos-order-detail-line',
  templateUrl: './order-line.component.html',
  styles: [':host { display: flex; width: 100% }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderLineComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) item!: OrderLine;

  public quantity: FormControl<number> = new FormControl<number>(1, {
    nonNullable: true,
  });

  public loading = false;

  private alert = inject(MosAlertService);
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private dataService: DataService,
    private changeDetectorRef: ChangeDetectorRef,
    private store: Store
  ) {}

  public ngOnChanges({ item }: SimpleChanges): void {
    if (item && item.currentValue?.quantity !== item.previousValue?.quantity) {
      this.quantity.setValue(item.currentValue?.quantity, { emitEvent: false });
    }
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
