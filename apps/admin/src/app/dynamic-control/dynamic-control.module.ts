import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MosComponentOutletDirective } from '@mosaic/cdk';

import { registerDefaultFormInputs } from './utils';
import { DynamicFormInputComponent } from './dynamic-input';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, SharedModule, MosComponentOutletDirective],
  declarations: [DynamicFormInputComponent],
  exports: [DynamicFormInputComponent],
})
export class MosDynamicControlModule {
  static forRoot(): ModuleWithProviders<MosDynamicControlModule> {
    return {
      ngModule: MosDynamicControlModule,
      providers: [registerDefaultFormInputs()],
    };
  }

  static forChild(): ModuleWithProviders<MosDynamicControlModule> {
    return {
      ngModule: MosDynamicControlModule,
    };
  }
}
