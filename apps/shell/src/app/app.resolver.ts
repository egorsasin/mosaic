import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

@Injectable()
export class AppResolver  {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  resolve(): Observable<boolean> {
    return this.authService.checkAuthenticatedStatus().pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }
}
