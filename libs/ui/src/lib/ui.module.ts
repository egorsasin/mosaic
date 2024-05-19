import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OverlayHostComponent } from './overlay-host';
import { HintModule } from './hint';
import { MosInputModule } from './input';

const COMPONENTS = [OverlayHostComponent];
const MODULES = [HintModule, MosInputModule];

@NgModule({
  imports: [CommonModule, ...COMPONENTS, ...MODULES],
  exports: [...COMPONENTS, ...MODULES],
})
export class MosaicUiModule {}
