import { Component } from '@angular/core';

import { ActiveOrderService } from '../../active-order';

@Component({
  selector: 'mos-mini-cart',
  templateUrl: './mini-cart.component.html',
  styleUrls: ['./mini-cart.component.scss'],
})
export class MiniCartComponent {
  public order$ = this.activeOrderService.activeOrder$;

  constructor(private readonly activeOrderService: ActiveOrderService) {}
}
