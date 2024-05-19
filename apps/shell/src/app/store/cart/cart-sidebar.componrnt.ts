import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { Sidebar, SidebarModule } from '../../shared/sidebar';
import { MiniCartModule } from '../../shared/mini-cart/mini-cart.module';

@Component({
  selector: 'mos-cart-sidebar',
  template: '<mos-mini-cart></mos-mini-cart>',
  styles: [
    `
      :host {
        @apply p-6 block;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, MiniCartModule, SidebarModule],
})
export class CartSidebarComponent implements Sidebar<unknown> {
  public resolveSidebarWith(result?: unknown) {
    // DO NOTHING
  }
}
