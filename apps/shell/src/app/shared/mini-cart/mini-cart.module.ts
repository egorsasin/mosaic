import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MosAssetPreviewPipe } from '@mosaic/common-ui';
import { MosLetDirective } from '@mosaic/cdk';

import { MiniCartComponent } from './mini-cart.component';
import { MosQuantitySelectorComponent } from '../quantity-selector';

@NgModule({
  declarations: [MiniCartComponent],
  exports: [MiniCartComponent],
  imports: [
    CommonModule,
    MosAssetPreviewPipe,
    RouterModule,
    MosLetDirective,
    MosQuantitySelectorComponent,
  ],
})
export class MiniCartModule {}
