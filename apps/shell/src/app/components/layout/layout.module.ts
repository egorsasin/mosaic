import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HintModule } from '@mosaic/ui/hint';
import { MosLetDirective } from '@mosaic/cdk';

import { UserStatusComponent } from '../user-status/user-status.component';

import {
  LayoutRoutingModule,
  ROUTED_COMPONENTS,
} from './layout-routing.module';
import { MiniCartModule } from '../../shared/mini-cart/mini-cart.module';

@NgModule({
  declarations: [...ROUTED_COMPONENTS, UserStatusComponent],
  imports: [
    CommonModule,
    MosLetDirective,
    FormsModule,
    LayoutRoutingModule,
    HintModule,
    MiniCartModule,
  ],
  providers: [],
  bootstrap: [],
})
export class LayoutModule {}
