import { NgModule } from '@angular/core';

import { MosMaskModule } from '@mosaic/mask';

import {
  CheckoutRoutingModule,
  routedComponents,
} from './checkout-routing.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [...routedComponents],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    MosMaskModule,
    ReactiveFormsModule,
  ],
})
export class CheckoutModule {}
