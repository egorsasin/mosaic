import { Injectable } from '@angular/core';
import {
  catchError,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Store } from '@ngrx/store';

import {
  SetAsLoggedInVariable,
  UserStatusQuery,
  SET_AS_LOGGED_IN,
  SET_AS_LOGGED_OUT,
  GET_USER_STATUS,
} from '../data/client';
import { DataService } from '../data';
import { LocalStorageService } from '../services/local-storage.service';
import { loadActiveCustomer } from '../store';

import { GET_CURRENT_USER } from './auth.definitions';
import { CurrentUserQuery } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private store: Store,
    private dataService: DataService,
    private localStorageService: LocalStorageService
  ) {}

  public getAuthenticatedStatus(): Observable<boolean> {
    return this.userStatus().single$.pipe(
      map(({ userStatus }) => userStatus?.isLoggedIn)
    );
  }

  public checkAuthenticatedStatus(): Observable<boolean> {
    return this.getAuthenticatedStatus().pipe(
      mergeMap((isLoggedIn) => {
        if (!isLoggedIn) {
          return this.validateAuthToken();
        }
        return of(true);
      })
    );
  }

  public loginSuccess(username: string) {
    return this.dataService.mutate<UserStatusQuery, SetAsLoggedInVariable>(
      SET_AS_LOGGED_IN,
      {
        input: {
          username,
          loginTime: Date.now().toString(),
        },
      }
    );
  }

  public logOut(): Observable<boolean> {
    return this.userStatus().single$.pipe(
      switchMap(({ userStatus }) => {
        if (userStatus.isLoggedIn) {
          return this.clientLogOut().pipe(
            tap(() => this.localStorageService.remove('authToken')),
            map(() => true)
          );
        } else {
          return of(true);
        }
      })
    );
  }

  private userStatus() {
    return this.dataService.query<UserStatusQuery>(
      GET_USER_STATUS,
      {},
      'cache-first'
    );
  }

  private clientLogOut() {
    return this.dataService.mutate(SET_AS_LOGGED_OUT);
  }

  private validateAuthToken(): Observable<boolean> {
    return this.dataService
      .query<CurrentUserQuery>(GET_CURRENT_USER)
      .single$.pipe(
        mergeMap((result) => {
          if (!result.me) {
            return of(false);
          }
          const { me } = result;
          this.store.dispatch(loadActiveCustomer());
          return this.loginSuccess(me.identifier);
        }),
        map(() => true),
        catchError(() => of(false))
      );
  }
}
