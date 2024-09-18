import { Injectable } from '@angular/core';

import { BaseDataService } from './base-data.service';
import { ATTEMPT_LOGIN } from '../definitions';
import { AttemptLoginMutation, AttemptLoginMutationVariables } from '../models';
import {
  SET_AS_LOGGED_IN,
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
}
