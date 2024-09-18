import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login.component';

export const loginRoutes: Routes = [
  {
    path: '',
    component: LoginComponent,
    pathMatch: 'full',
    canActivate: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(loginRoutes)],
  exports: [],
  declarations: [LoginComponent],
})
export class LoginModule {}
