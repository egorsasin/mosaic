import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards';

import { LayoutComponent } from './layout.component';

export const ROUTED_COMPONENTS = [LayoutComponent];

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/coffee',
      },
      // {
      //   path: 'profile',
      //   loadChildren: () =>
      //     import('../profile').then((m) => m.MosProfileModule),
      //   canActivate: [AuthGuard],
      // },
      {
        path: 'checkout',
        loadChildren: () =>
          import('../../modules/checkout/checkout.module').then(
            (m) => m.CheckoutModule
          ),
      },
      {
        path: 'order',
        loadChildren: () =>
          import('../../modules/order-details/order-details.module').then(
            (m) => m.OrderDetailsModule
          ),
      },
      {
        path: 'coffee',
        loadChildren: () =>
          import('../../product/product.module').then((m) => m.ProductModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class LayoutRoutingModule {}
