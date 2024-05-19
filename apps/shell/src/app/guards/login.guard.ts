import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Injectable()
export class LoginGuard  {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  public canActivate(): Observable<boolean> {
    return this.authService.checkAuthenticatedStatus().pipe(
      map((authenticated: boolean) => {
        if (authenticated) {
          this.router.navigate(['/']);
        }
        return !authenticated;
      })
    );
  }
}
