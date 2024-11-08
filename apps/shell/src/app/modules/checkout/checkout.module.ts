import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';

import { MosLetDirective } from '@mosaic/cdk';
import { MosMaskModule } from '@mosaic/mask';
import { MosInputModule } from '@mosaic/ui/input';
import { MosInputPasswordModule } from '@mosaic/ui/input-password';
import { MosAssetPreviewPipe, ControlErrorModule } from '@mosaic/common-ui';
import { HintModule } from '@mosaic/ui/hint';
import { MosIconComponent } from '@mosaic/ui/svg-icon';

import {
  CheckoutRoutingModule,
  routedComponents,
} from './checkout-routing.module';
import { MosQuantitySelectorComponent } from '../../shared';
import { OrderLineComponent } from './order-line';
import { CheckoutService } from './checkout.service';
import * as checkoutEffects from './store/checkout.effects';
import { InpostModule } from '../../inpost/inpost.module';
import { ShippingMethodModule } from '../../shipping';

@NgModule({
  declarations: [...routedComponents, OrderLineComponent],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    MosMaskModule,
    MosAssetPreviewPipe,
    MosLetDirective,
    ReactiveFormsModule,
    HintModule,
    MosInputModule,
    MosInputPasswordModule,
    MosQuantitySelectorComponent,
    ControlErrorModule,
    EffectsModule.forFeature([checkoutEffects]),
    InpostModule,
    ShippingMethodModule,
    MosIconComponent,
  ],
  providers: [CheckoutService],
})
export class CheckoutModule {}
