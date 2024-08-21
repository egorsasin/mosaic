import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MosInputModule } from '@mosaic/ui/input';
import { MosSwitchComponent } from '@mosaic/ui/switch';
import { MosDropdownModule } from '@mosaic/ui/dropdown';
import { MosMaskModule } from '@mosaic/mask';
import { MosLetDirective } from '@mosaic/cdk';
import { MosIconComponent } from '@mosaic/ui/svg-icon';

import { SharedModule } from '../../shared/shared.module';
import {
  CategoryRoutingModule,
  ROUTED_COMPONENTS,
} from './category-routing.module';
import { MosDynamicControlModule } from '../../dynamic-control/dynamic-control.module';

@NgModule({
  declarations: [...ROUTED_COMPONENTS],
  imports: [
    CommonModule,
    MosLetDirective,
    CategoryRoutingModule,
    ReactiveFormsModule,
    MosInputModule,
    SharedModule,
    MosSwitchComponent,
    MosMaskModule,
    MosDropdownModule,
    MosIconComponent,
    MosDynamicControlModule.forChild(),
  ],
  providers: [],
})
export class CategoryModule {}
