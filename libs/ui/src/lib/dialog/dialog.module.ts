import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MosComponentOutletDirective } from '@mosaic/cdk';

import { MosDialogComponent } from './dialog.component';

const DECLARATIONS = [MosDialogComponent];

@NgModule({
  imports: [BrowserAnimationsModule, CommonModule, MosComponentOutletDirective],
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
  providers: [],
})
export class MosDialogModule {}
