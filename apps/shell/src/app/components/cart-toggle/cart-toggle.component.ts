import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'mos-cart-toggle',
  templateUrl: './cart-toggle.component.html',
  styleUrls: ['./cart-toggle.component.scss'],
})
export class CartToggleComponent implements OnInit {
  @Output() toggle = new EventEmitter<void>();
  cart$?: Observable<{ total: number; quantity: number }>;
  cartChangeIndication$?: Observable<boolean>;

  constructor() {}

  ngOnInit() {}
}
