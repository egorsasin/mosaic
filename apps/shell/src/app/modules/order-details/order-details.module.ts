import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MosAssetPreviewPipe } from '@mosaic/common-ui';

import {
  OrderDetailsRoutingModule,
  routedComponents,
} from './order-details-routing.module';
import { OrderLineComponent } from './order-line';

@NgModule({
  imports: [CommonModule, OrderDetailsRoutingModule, MosAssetPreviewPipe],
  declarations: [routedComponents, OrderLineComponent],
})
export class OrderDetailsModule {}
