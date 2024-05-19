import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MosBaseInputComponent } from './base-input.component';

@NgModule({
  declarations: [MosBaseInputComponent],
  imports: [CommonModule, FormsModule],
  exports: [MosBaseInputComponent],
})
export class MosBaseInputModule {}
