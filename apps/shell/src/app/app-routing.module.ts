import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppResolver } from './app.resolver';
import { LoginGuard } from './guards/';

export const ROUTED_COMPONENTS = [];

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    canActivate: [LoginGuard],
  },
  {
    path: '',
    loadChildren: () =>
      import('./components/layout/layout.module').then((m) => m.LayoutModule),
    resolve: { appData: AppResolver },
  },
  {
    path: '**',
    redirectTo: '/',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'disabled',
    }),
  ],
  exports: [RouterModule],
  providers: [AppResolver, LoginGuard],
})
export class AppRoutingModule {}
