import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';

import { Product } from '../../types';
import { ProductService } from '../product.service';
import { Store } from '@ngrx/store';
import { setActiveOrder } from '../../store';
import { showSidebarCart } from '../../store/cart/cart.actions';

@Component({
  selector: 'mos-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() public product?: Product;

  public loading = false;
  public quantity = '1';

  constructor(
    private store: Store,
    private productService: ProductService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  public addToCart(value: number): void {
    if (!this.product) {
      return;
    }

    this.loading = true;
    this.productService.addToCart(this.product?.id, +value).subscribe({
      next: (data) => {
        const { addItemToOrder: order } = data;

        this.store.dispatch(setActiveOrder({ order }));
        this.store.dispatch(showSidebarCart());
      },
      complete: () => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }
}
