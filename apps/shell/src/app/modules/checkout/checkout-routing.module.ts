import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CheckoutProcessComponent } from './checkout-process/checkout-process.component';
import { paymentStateResolver } from './payment-state.resolver';
import { PaymentStateComponent } from './payment-state.component';

export const routedComponents = [CheckoutProcessComponent];

export const routes: Routes = [
  {
    path: 'payment-status/:paymentMethod',
    resolve: {
      orderCode: paymentStateResolver,
    },
    component: PaymentStateComponent,
  },
  {
    path: '',
    component: CheckoutProcessComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CheckoutRoutingModule {}
