import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'products',
    loadChildren: () =>
      import('./pages/product/product.module').then((m) => m.ProductModule),
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./pages/order/order.module').then((m) => m.OrderModule),
  },
  {
    path: 'assets',
    loadChildren: () =>
      import('./pages/asset/asset.module').then((m) => m.AssetModule),
  },
  {
    path: 'payment-methods',
    loadChildren: () =>
      import('./pages/payment-method/payment-method.module').then(
        (m) => m.PaymentMethodModule
      ),
  },
  {
    path: '**',
    redirectTo: '/orders',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'disabled',
    }),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
