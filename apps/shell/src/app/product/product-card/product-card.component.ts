import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { filter, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { OrderLine } from '@mosaic/common';
import { FormControl } from '@angular/forms';

import { Order } from '@mosaic/common';
import { MosDialogService } from '@mosaic/ui/dialog';

import { Product } from '../../types';
import {
  selectActiveOrder,
  setActiveOrder,
  showNotification,
  CartActions,
} from '../../store';

import { CartDataService } from '../../data';

@Component({
  selector: 'mos-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() public product?: Product;

  public quantityInCart$ = this.store.select(selectActiveOrder).pipe(
    filter((order) => Boolean(order)),
    map(({ lines }) => {
      const currentProduct = lines?.find(
        ({ product }: OrderLine) => product.id === this.product?.id
      );

      return currentProduct?.quantity || 0;
    })
  );

  public quantity: FormControl<number> = new FormControl<number>(1, {
    nonNullable: true,
  });

  public loading = false;

  constructor(
    private store: Store,
    private dataService: CartDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogService: MosDialogService
  ) {}

  public addToCart(): void {
    if (!this.product) {
      return;
    }

    this.loading = true;
    this.dataService
      .addItemToCart(this.product?.id, this.quantity.value)
      .pipe(map(({ addItemToOrder }) => addItemToOrder))
      .subscribe({
        next: (order: Order) => {
          if (order.__typename === 'Order') {
            this.store.dispatch(setActiveOrder({ order }));
            this.store.dispatch(CartActions.addToCartNotification());
          } else {
            this.store.dispatch(
              showNotification({ message: (order as any).message })
            );
          }
        },

        complete: () => {
          this.loading = false;
          this.quantity.setValue(1);
          this.changeDetectorRef.markForCheck();
        },
      });
  }
}
