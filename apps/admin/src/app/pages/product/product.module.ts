import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MosInputModule } from '@mosaic/ui/input';
import { MosSwitchComponent } from '@mosaic/ui/switch';
import { MosMaskModule } from '@mosaic/mask';
import { MosLetDirective } from '@mosaic/cdk';

import {
  ProductRoutingModule,
  ROUTED_COMPONENTS,
} from './product-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [...ROUTED_COMPONENTS],
  imports: [
    CommonModule,
    ProductRoutingModule,
    ReactiveFormsModule,
    MosInputModule,
    SharedModule,
    MosSwitchComponent,
    MosMaskModule,
    MosLetDirective,
  ],
  providers: [],
})
export class ProductModule {}
