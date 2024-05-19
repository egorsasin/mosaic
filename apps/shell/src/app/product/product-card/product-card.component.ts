import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

import { Product } from '../../types';
import { ProductService } from '../product.service';
import { Store } from '@ngrx/store';
import { setActiveOrder } from '../../store';

@Component({
  selector: 'mos-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() public product?: Product;

  public quantity = '1';

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    items: 1,
    nav: true,
  };

  constructor(private store: Store, private productService: ProductService) {}

  public addToCart(): void {
    if (!this.product) {
      return;
    }

    this.productService
      .addToCart(this.product?.id, +this.quantity)
      .subscribe((data) => {
        const { addItemToOrder: order } = data;
        this.store.dispatch(setActiveOrder({ order }));
      });
  }
}
