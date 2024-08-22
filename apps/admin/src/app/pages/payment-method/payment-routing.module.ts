import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { createBaseDetailResolveFn } from '../../common/utils';
import { PaymentListComponent } from './payment-list';
import { PaymentMethodComponent } from './payment-method-item';
import { GET_PAYMENT_METHOD_DETAIL } from '../../data';

export const ROUTED_COMPONENTS = [PaymentListComponent, PaymentMethodComponent];

const routes: Routes = [
  {
    path: '',
    component: PaymentListComponent,
  },
  {
    path: ':id',
    component: PaymentMethodComponent,
    resolve: {
      detail: createBaseDetailResolveFn({
        query: GET_PAYMENT_METHOD_DETAIL,
        entityKey: 'paymentMethod',
      }),
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {}
