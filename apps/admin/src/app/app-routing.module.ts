import { inject, NgModule } from '@angular/core';
import { CanActivateFn, Router, RouterModule, Routes } from '@angular/router';
import { AuthService } from './providers';
import { map } from 'rxjs';
import { LayoutComponent } from './layout';

export const ROUTED_COMPONENTS = [LayoutComponent];

const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthenticatedStatus().pipe(
    map((authenticated: boolean) => {
      if (!authenticated) {
        router.navigate(['/login']);
      }

      return authenticated;
    })
  );
};

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      {
        path: 'categories',
        loadChildren: () =>
          import('./pages/category/category.module').then(
            (m) => m.CategoryModule
          ),
      },
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
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'disabled',
    }),
  ],
  declarations: [],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
