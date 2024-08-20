import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MosInputModule } from '@mosaic/ui/input';
import { MosSwitchComponent } from '@mosaic/ui/switch';
import { MosMaskModule } from '@mosaic/mask';

import { SharedModule } from '../../shared/shared.module';
import {
  CategoryRoutingModule,
  ROUTED_COMPONENTS,
} from './category-routing.module';

@NgModule({
  declarations: [...ROUTED_COMPONENTS],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    ReactiveFormsModule,
    MosInputModule,
    SharedModule,
    MosSwitchComponent,
    MosMaskModule,
  ],
  providers: [],
})
export class CategoryModule {}
