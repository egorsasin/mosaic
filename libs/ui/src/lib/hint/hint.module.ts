import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HintHostDirective } from './hint-host';
import { HintPositionDirective } from './hint-position.directive';
import { HintComponent } from './hint.component';
import { HintDirective } from './hint.directive';

const DECLARATIONS = [HintPositionDirective, HintDirective, HintHostDirective];

@NgModule({
  imports: [CommonModule],
  declarations: [...DECLARATIONS, HintComponent],
  exports: [...DECLARATIONS],
})
export class HintModule {}
