import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosComponentOutletDirective, MosLetDirective } from '@mosaic/cdk';

import { ShippingMethodComponent } from './shipping-method.component';
import { ShippingMethodSelectorComponent } from './shipping-method-selector.component';

@NgModule({
  declarations: [ShippingMethodComponent, ShippingMethodSelectorComponent],
  imports: [CommonModule, MosComponentOutletDirective, MosLetDirective],
  providers: [],
  exports: [ShippingMethodSelectorComponent],
})
export class ShippingMethodModule {}
