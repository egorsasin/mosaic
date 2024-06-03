import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MosInputModule } from '@mosaic/ui/input';
import { MosSwitchComponent } from '@mosaic/ui/switch';
import { MosMaskModule } from '@mosaic/mask';

import { OrderDataService } from './order.service';
import { OrderRoutingModule, ROUTED_COMPONENTS } from './order-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [...ROUTED_COMPONENTS],
  imports: [
    CommonModule,
    OrderRoutingModule,
    ReactiveFormsModule,
    MosInputModule,
    SharedModule,
    MosSwitchComponent,
    MosMaskModule,
  ],
  providers: [OrderDataService],
})
export class OrderModule {}
