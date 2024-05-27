import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MiniCartComponent } from './mini-cart.component';
import { MosAssetPreviewPipe } from '../../product/asset-preview';

@NgModule({
  declarations: [MiniCartComponent],
  exports: [MiniCartComponent],
  imports: [CommonModule, MosAssetPreviewPipe, RouterModule],
})
export class MiniCartModule {}
