import { Component } from '@angular/core';
import { map } from 'rxjs';

import { ActiveOrderService } from '../../active-order';

@Component({
  selector: 'mos-mini-cart',
  templateUrl: './mini-cart.component.html',
  styleUrls: ['./mini-cart.component.scss'],
})
export class MiniCartComponent {
  public items$ = this.activeOrderService.activeOrder$.pipe(
    map((order) => order.lines)
  );

  constructor(private readonly activeOrderService: ActiveOrderService) {}
}
