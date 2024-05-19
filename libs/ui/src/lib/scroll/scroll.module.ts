import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosScrollComponent } from './scroll.component';
import { MosScrollbarModule } from '../scrollbar';

@NgModule({
  imports: [CommonModule, MosScrollbarModule],
  declarations: [MosScrollComponent],
  exports: [MosScrollComponent],
  providers: [],
})
export class MosScrollModule {}
