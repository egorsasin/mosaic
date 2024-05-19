import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosActiveZoneDirective } from '../active-zone';

import { DropdownHostComponent } from './dropdown-host.component';
import { MosDropdownOptionDirective } from './dropdown-option.directive';
import { MosDropdownPositionDirective } from './dropdown-position.directive';
import { MosDropdownComponent } from './dropdown.component';
import { MosDropdownDirective } from './dropdown.directive';
import { MosDropdownHostDirective } from './dropdown-host.directive';
import { MosDropdownListDirective } from './dropdown-list.directive';
import { MosDropdownHostedDirective } from './dropdown-hosted.directive';

@NgModule({
  declarations: [
    DropdownHostComponent,
    MosDropdownDirective,
    MosDropdownHostDirective,
    MosDropdownHostedDirective,
    MosDropdownPositionDirective,
    MosDropdownOptionDirective,
    MosDropdownComponent,
    MosDropdownListDirective,
  ],
  imports: [CommonModule, MosActiveZoneDirective],
  exports: [
    MosDropdownDirective,
    MosDropdownOptionDirective,
    MosDropdownHostDirective,
    MosDropdownPositionDirective,
    MosDropdownComponent,
    MosDropdownHostedDirective,
    MosDropdownListDirective,
  ],
})
export class MosDropdownModule {}
