import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { OrderListComponent } from './order-list';

export const ROUTED_COMPONENTS = [OrderListComponent];
export const CREATE_ROUTE_PARAM = 'create';

const routes: Routes = [
  {
    path: '',
    component: OrderListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
