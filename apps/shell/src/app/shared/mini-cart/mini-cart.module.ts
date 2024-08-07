import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MosAssetPreviewPipe } from '@mosaic/common-ui';
import { MosLetDirective } from '@mosaic/cdk';

import { MiniCartComponent } from './mini-cart.component';
import { MosQuantitySelectorComponent } from '../quantity-selector';
import { CartLineComponent } from './cart-line';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MiniCartComponent, CartLineComponent],
  exports: [MiniCartComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MosAssetPreviewPipe,
    RouterModule,
    MosLetDirective,
    MosQuantitySelectorComponent,
  ],
})
export class MiniCartModule {}
