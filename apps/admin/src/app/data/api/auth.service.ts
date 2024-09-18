import { Injectable } from '@angular/core';

import { BaseDataService } from './base-data.service';
import { ATTEMPT_LOGIN } from '../definitions';
import { AttemptLoginMutation, AttemptLoginMutationVariables } from '../models';

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
}
