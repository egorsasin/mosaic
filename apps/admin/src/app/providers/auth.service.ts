import { Injectable } from '@angular/core';

import { AuthDataService, AdministratorDataService } from '../data';
import { Observable, of, switchMap } from 'rxjs';

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
        // if (login.__typename === 'CurrentUser') {
        //   return this.administratorDataService
        //     .getActiveAdministrator()
        //     .single$.pipe();
        // }
        //             switchMap(({ activeAdministrator }) => {
        //                 if (activeAdministrator) {
        //                     return this.dataService.client
        //                         .loginSuccess(
        //                             activeAdministrator.id,
        //                             `${activeAdministrator.firstName} ${activeAdministrator.lastName}`,
        //                             activeChannel.id,
        //                             login.channels,
        //                         )
        //                         .pipe(map(() => login));
        //                 } else {
        //                     return of(login);
        //                 }
        //             }),
        //         );

        return of(login);
      })
    );
  }
}
