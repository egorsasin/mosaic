import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { MosIconComponent } from '@mosaic/ui/svg-icon';

import { MosAssetPreviewPipe, MosSentenceCasePipe } from './pipes';
import {
  MosAssetPickerDialogComponent,
  MosAssetsComponent,
  MosPaginationComponent,
  MosProductMultiSelectorDialogComponent,
} from './components';

const DECLARATIONS = [
  MosAssetPreviewPipe,
  MosSentenceCasePipe,
  MosAssetsComponent,
  MosAssetPickerDialogComponent,
  MosPaginationComponent,
  MosProductMultiSelectorDialogComponent,
];

@NgModule({
  imports: [CommonModule, DragDropModule, MosIconComponent],
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
})
export class SharedModule {}
