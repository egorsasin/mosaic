import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CheckoutProcessComponent } from './checkout-process/checkout-process.component';

export const routedComponents = [CheckoutProcessComponent];

export const routes: Routes = [
  {
    path: '',
    component: CheckoutProcessComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CheckoutRoutingModule {}
