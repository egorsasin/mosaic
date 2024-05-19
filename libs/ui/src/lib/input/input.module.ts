import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MosBaseInputModule } from '../base-input';
import { MosActiveZoneDirective } from '../active-zone';
import { MosDropdownModule } from '../dropdown/dropdown.module';

import { MosInputComponent } from './input.component';

@NgModule({
  imports: [
    MosActiveZoneDirective,
    CommonModule,
    MosBaseInputModule,
    MosDropdownModule,
    FormsModule,
  ],
  declarations: [MosInputComponent],
  exports: [MosInputComponent],
  providers: [],
})
export class MosInputModule {}
