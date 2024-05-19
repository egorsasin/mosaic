import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosSelectComponent } from './select.component';
import { MosActiveZoneDirective } from '../active-zone';
import { MosBaseInputModule } from '../base-input';
import { MosDropdownModule } from '../dropdown';
import { MosCustomContentComponent } from '../common';

@NgModule({
  imports: [
    CommonModule,
    MosActiveZoneDirective,
    MosBaseInputModule,
    MosCustomContentComponent,
    MosDropdownModule,
  ],
  declarations: [MosSelectComponent],
  exports: [MosSelectComponent],
  providers: [],
})
export class MosSelectModule {}
