import { Injectable } from '@angular/core';

import { AuthDataService, AdministratorDataService } from '../data';
import { map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private authDataService: AuthDataService,
    private administratorDataService: AdministratorDataService
  ) {}

  /**
   * Attempts to log in via the REST login endpoint and updates the app
   * state on success.
   */
  public logIn(username: string, password: string): Observable<any> {
    return this.authDataService.attemptLogin(username, password).pipe(
      switchMap(({ login }) => {
        if (login.__typename === 'CurrentUser') {
          return this.administratorDataService
            .getActiveAdministrator()
            .single$.pipe(
              switchMap(({ activeAdministrator }) => {
                if (activeAdministrator) {
                  return this.authDataService
                    .loginSuccess(activeAdministrator.emailAddress)
                    .pipe(map(() => true));
                } else {
                  return of(false);
                }
              })
            );
        }

        return of(false);
      })
    );
  }
}
