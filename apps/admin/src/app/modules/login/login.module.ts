import { inject, NgModule } from '@angular/core';
import { CanActivateFn, Router, RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../providers';

const loggedInGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthenticatedStatus().pipe(
    map((authenticated) => {
      if (authenticated) {
        router.navigate(['/']);
      }

      return !authenticated;
    })
  );
};

export const loginRoutes: Routes = [
  {
    path: '',
    component: LoginComponent,
    pathMatch: 'full',
    canActivate: [loggedInGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(loginRoutes), ReactiveFormsModule],
  exports: [],
  declarations: [LoginComponent],
})
export class LoginModule {}
