import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MosLetDirective } from '@mosaic/cdk';
import { MosMaskModule } from '@mosaic/mask';
import { MosInputModule } from '@mosaic/ui/input';
import { MosInputPasswordModule } from '@mosaic/ui/input-password';
import { MosAssetPreviewPipe, ControlErrorModule } from '@mosaic/common-ui';
import { HintModule } from '@mosaic/ui/hint';

import {
  CheckoutRoutingModule,
  routedComponents,
} from './checkout-routing.module';
import { MosQuantitySelectorComponent } from '../shared';

@NgModule({
  declarations: [...routedComponents],
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
  ],
})
export class CheckoutModule {}
