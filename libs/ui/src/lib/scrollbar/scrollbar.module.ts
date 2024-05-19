import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosScrollbarComponent } from './scrollbar.component';
import { MosScrollbarDirective } from './scrollbar.directive';
import { MosScrollbarWrapperDirective } from './scrollbar-wrapper.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    MosScrollbarComponent,
    MosScrollbarDirective,
    MosScrollbarWrapperDirective,
  ],
  exports: [
    MosScrollbarComponent,
    MosScrollbarDirective,
    MosScrollbarWrapperDirective,
  ],
  providers: [],
})
export class MosScrollbarModule {}
