import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MosLetDirective } from '@mosaic/cdk';
import { MosMaskModule } from '@mosaic/mask';
import { MosInputModule } from '@mosaic/ui/input';
import { MosInputPasswordModule } from '@mosaic/ui/input-password';

import {
  CheckoutRoutingModule,
  routedComponents,
} from './checkout-routing.module';

@NgModule({
  declarations: [...routedComponents],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    MosMaskModule,
    MosLetDirective,
    ReactiveFormsModule,
    MosInputModule,
    MosInputPasswordModule,
  ],
})
export class CheckoutModule {}
