import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosAlertHostComponent } from './components';
import { MosAlertService } from './alert.service';
import { MosContextPipe } from './context.pipe';

const DECLARATIONS = [MosAlertHostComponent];

@NgModule({
  imports: [CommonModule],
  declarations: [...DECLARATIONS, MosContextPipe],
  exports: [...DECLARATIONS],
  providers: [MosAlertService],
})
export class MosAlertModule {}
