import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MosBaseInputComponent } from './base-input.component';
import { MosNativeInputDirective } from './native-input.directive';

@NgModule({
  declarations: [MosBaseInputComponent, MosNativeInputDirective],
  imports: [CommonModule, FormsModule],
  exports: [MosBaseInputComponent, MosNativeInputDirective],
})
export class MosBaseInputModule {}
