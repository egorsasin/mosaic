import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MosComponentOutletDirective, MosLetDirective } from '@mosaic/cdk';
import { MosSelectModule } from '@mosaic/ui/select';
import { MosOptionDirective } from '@mosaic/ui/option';
import { MosInputModule } from '@mosaic/ui/input';

import {
  PaymentRoutingModule,
  ROUTED_COMPONENTS,
} from './payment-routing.module';
import { PaymentMethodDataService } from './payment-method.service';
import { SharedModule } from '../../shared/shared.module';
import { DynamicFormInputComponent } from './dynamic-input';

@NgModule({
  declarations: [...ROUTED_COMPONENTS, DynamicFormInputComponent],
  imports: [
    CommonModule,
    PaymentRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    MosLetDirective,
    MosInputModule,
    MosSelectModule,
    MosOptionDirective,
    MosComponentOutletDirective,
  ],
  providers: [PaymentMethodDataService],
})
export class PaymentMethodModule {}
