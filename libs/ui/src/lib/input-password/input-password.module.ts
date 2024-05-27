import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MosBaseInputModule } from '../base-input';
import { MosInputPasswordComponent } from './input-password.component';
import { MosInputPasswordDirective } from './input-password.directive';

@NgModule({
  imports: [CommonModule, MosBaseInputModule, FormsModule],
  declarations: [MosInputPasswordComponent, MosInputPasswordDirective],
  exports: [MosInputPasswordComponent, MosInputPasswordDirective],
  providers: [],
})
export class MosInputPasswordModule {}
