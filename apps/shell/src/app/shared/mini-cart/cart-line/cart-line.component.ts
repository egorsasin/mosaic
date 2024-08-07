import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { exhaustMap, mergeMap, of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { OrderLine } from '@mosaic/common';
import { MosAlertService } from '@mosaic/ui/alert';

import {
  AdjustItemQuantityMutation,
  AdjustItemQuantityMutationVariables,
  DataService,
} from '../../../data';
import { ADJUST_ITEM_QUANTITY } from '../../../common';
import { refetchShippingMethods } from '../../../modules/checkout';

@Component({
  selector: 'mos-cart-line',
  templateUrl: './cart-line.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartLineComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true })
  public item!: OrderLine;

  public quantity: FormControl<number> = new FormControl<number>(1, {
    nonNullable: true,
  });

  private alert = inject(MosAlertService);
  private dataService = inject(DataService);
  private readonly store = inject(Store);
  private destroy$: Subject<void> = new Subject<void>();

  public ngOnChanges({ item }: SimpleChanges): void {
    if (item && item.currentValue?.quantity !== item.previousValue?.quantity) {
      this.quantity.setValue(item.currentValue?.quantity, { emitEvent: false });
    }
  }

  public ngOnInit(): void {
    this.quantity.valueChanges
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
        mergeMap(({ adjustOrderLine }) => {
          const { errorCode, message } = adjustOrderLine as any;

          if (errorCode) {
            this.quantity.reset(this.item.quantity, { emitEvent: false });
            return this.alert.open(message);
          }

          return of(true);
        })
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

  public removeProduct(): void {
    //
  }
}
