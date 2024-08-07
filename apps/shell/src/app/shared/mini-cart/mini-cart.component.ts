import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { selectActiveOrder } from '../../store';

@Component({
  selector: 'mos-mini-cart',
  templateUrl: './mini-cart.component.html',
  styleUrls: ['./mini-cart.component.scss'],
})
export class MiniCartComponent {
  public order$ = this.store.select(selectActiveOrder);

  constructor(private readonly store: Store) {}
}
