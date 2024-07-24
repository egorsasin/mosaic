import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlErrorComponent } from './control-error.component';
import { ControlErrorDirective } from './control-error.directive';
import { FormActionDirective } from './form-error.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    ControlErrorDirective,
    ControlErrorComponent,
    FormActionDirective,
  ],
  exports: [ControlErrorDirective, FormActionDirective],
})
export class ControlErrorModule {}
