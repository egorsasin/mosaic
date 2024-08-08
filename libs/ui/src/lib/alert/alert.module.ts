import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosContextPipe } from '@mosaic/cdk';

import { MosIconComponent } from '../svg-icon';
import { MosAlertComponent, MosAlertHostComponent } from './components';
import { MosAlertService } from './alert.service';

const DECLARATIONS = [MosAlertHostComponent, MosAlertComponent];

@NgModule({
  imports: [CommonModule, MosIconComponent, MosContextPipe],
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
  providers: [MosAlertService],
})
export class MosAlertModule {}
