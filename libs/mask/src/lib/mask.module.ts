import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MosMaskDirective } from './mask.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [MosMaskDirective],
  exports: [MosMaskDirective],
})
export class MosMaskModule {}
