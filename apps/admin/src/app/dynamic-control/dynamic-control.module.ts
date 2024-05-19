import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { registerDefaultFormInputs } from './default-form-inputs';

@NgModule({
  imports: [CommonModule],
  providers: [registerDefaultFormInputs()],
})
export class MosDynamicControlModule {}
