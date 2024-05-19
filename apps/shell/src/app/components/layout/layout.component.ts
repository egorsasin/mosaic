import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { showSidebarCart } from '../../store/cart/cart.actions';
import { ActiveOrderService } from '../../active-order';
import { map } from 'rxjs';

@Component({
  selector: 'mos-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  constructor(
    private store: Store,
    private activeOrderService: ActiveOrderService
  ) {}

  public order$ = this.activeOrderService.activeOrder$;

  // Открыть корзину в сайдбаре
  public showCart(): void {
    this.store.dispatch(showSidebarCart());
  }
}
