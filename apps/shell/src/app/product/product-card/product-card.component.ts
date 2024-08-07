import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { filter, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { OrderLine } from '@mosaic/common';

import { Product } from '../../types';
import { ProductService } from '../product.service';
import {
  selectActiveOrder,
  setActiveOrder,
  showNotification,
} from '../../store';
import { FormControl } from '@angular/forms';
import { Order } from '@mosaic/common';

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
    private productService: ProductService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  public addToCart(): void {
    if (!this.product) {
      return;
    }

    this.loading = true;
    this.productService
      .addToCart(this.product?.id, this.quantity.value)
      .pipe(map(({ addItemToOrder }) => addItemToOrder))
      .subscribe({
        next: (order: Order) => {
          this.store.dispatch(
            order.__typename === 'Order'
              ? setActiveOrder({ order })
              : showNotification({ message: (order as any).message })
          );
        },
        complete: () => {
          this.loading = false;
          this.quantity.setValue(1);
          this.changeDetectorRef.markForCheck();
        },
      });
  }
}
