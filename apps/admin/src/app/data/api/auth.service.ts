import { Injectable } from '@angular/core';

import { Success } from '@mosaic/common';

import { BaseDataService } from './base-data.service';
import { ATTEMPT_LOGIN, GET_CURRENT_USER, LOG_OUT } from '../definitions';
import {
  AttemptLoginMutation,
  AttemptLoginMutationVariables,
  CurrentUserQuery,
} from '../models';
import {
  GET_USER_STATUS,
  SET_AS_LOGGED_IN,
  SET_AS_LOGGED_OUT,
  SetAsLoggedInVariable,
  UserStatusQuery,
} from '../client';

@Injectable()
export class AuthDataService {
  constructor(private baseDataService: BaseDataService) {}

  public attemptLogin(username: string, password: string) {
    return this.baseDataService.mutate<
      AttemptLoginMutation,
      AttemptLoginMutationVariables
    >(ATTEMPT_LOGIN, {
      username,
      password,
    });
  }

  public loginSuccess(username: string) {
    return this.baseDataService.mutate<UserStatusQuery, SetAsLoggedInVariable>(
      SET_AS_LOGGED_IN,
      {
        input: {
          username,
          loginTime: Date.now().toString(),
        },
      }
    );
  }

  public currentUser() {
    return this.baseDataService.query<CurrentUserQuery>(GET_CURRENT_USER);
  }

  public userStatus() {
    return this.baseDataService.query<UserStatusQuery>(
      GET_USER_STATUS,
      {},
      'cache-first'
    );
  }

  public logOut() {
    return this.baseDataService.mutate<Success>(LOG_OUT);
  }

  public clientLogOut() {
    return this.baseDataService.mutate(SET_AS_LOGGED_OUT);
  }
}
