import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';

import { Product } from '../../types';
import { ProductService } from '../product.service';
import { Store } from '@ngrx/store';
import { setActiveOrder, showNotification } from '../../store';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs';
import { Order } from '@mosaic/common';

@Component({
  selector: 'mos-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() public product?: Product;

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
