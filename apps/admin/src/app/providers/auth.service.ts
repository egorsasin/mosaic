import { Injectable } from '@angular/core';

import { AuthDataService, AdministratorDataService } from '../data';
import { catchError, map, mergeMap, Observable, of, switchMap } from 'rxjs';

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

  /**
   * Checks the app state to see if the user is already logged in,
   * and if not, attempts to validate any auth token found.
   */
  public checkAuthenticatedStatus(): Observable<boolean> {
    return this.authDataService.userStatus().single$.pipe(
      mergeMap((data) => {
        if (!data.userStatus?.isLoggedIn) {
          return this.validateAuthToken();
        } else {
          return of(true);
        }
      })
    );
  }

  /**
   * Update the user status to being logged out.
   */
  public logOut(): Observable<boolean> {
    return this.authDataService.userStatus().single$.pipe(
      switchMap((status) => {
        if (status.userStatus.isLoggedIn) {
          return this.authDataService.logOut();
        } else {
          return [];
        }
      }),
      map(() => true)
    );
  }

  /**
   * Checks for an auth token and if found, attempts to validate
   * that token against the API.
   */
  private validateAuthToken(): Observable<boolean> {
    return this.authDataService.currentUser().single$.pipe(
      mergeMap(({ me }) => {
        if (!me) {
          return of(false) as any;
        }

        return this.administratorDataService
          .getActiveAdministrator()
          .single$.pipe(
            switchMap(({ activeAdministrator }) => {
              if (activeAdministrator) {
                return this.authDataService
                  .loginSuccess(activeAdministrator.id)
                  .pipe(map(() => true));
              } else {
                return of(false);
              }
            })
          );
      }),
      map(() => true),
      catchError((err) => of(false))
    );
  }
}
