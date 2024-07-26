import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosIconComponent } from '../svg-icon';
import { MosAlertComponent, MosAlertHostComponent } from './components';
import { MosAlertService } from './alert.service';
import { MosContextPipe } from './context.pipe';

const DECLARATIONS = [MosAlertHostComponent, MosAlertComponent];

@NgModule({
  imports: [CommonModule, MosIconComponent],
  declarations: [...DECLARATIONS, MosContextPipe],
  exports: [...DECLARATIONS],
  providers: [MosAlertService],
})
export class MosAlertModule {}
