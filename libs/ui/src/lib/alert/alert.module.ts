import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosAlertHostComponent } from './components';
import { MosAlertService } from './alert.service';

const DECLARATIONS = [MosAlertHostComponent];

@NgModule({
  imports: [CommonModule],
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
  providers: [MosAlertService],
})
export class MosAlertModule {}
