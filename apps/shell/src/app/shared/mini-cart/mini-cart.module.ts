import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MosAssetPreviewPipe } from '@mosaic/common-ui';

import { MiniCartComponent } from './mini-cart.component';

@NgModule({
  declarations: [MiniCartComponent],
  exports: [MiniCartComponent],
  imports: [CommonModule, MosAssetPreviewPipe, RouterModule],
})
export class MiniCartModule {}
