import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { take } from 'rxjs';
import { DataService } from '../data/data.service';

import { Exact } from '../types';

export const AUTHENTICATE = gql`
  mutation Authenticate($token: String!) {
    authenticate(input: { google: { token: $token } }) {
      ... on CurrentUser {
        id
        identifier
        firstName
        lastName
      }
    }
  }
`;

export namespace Authenticate {
  export type Variables = Exact<{
    token: string;
  }>;
  export type Mutation = unknown;
}

@Injectable()
export class GoogleAuthService {
  constructor(private dataService: DataService) {}

  public authenticate(token: string) {
    return this.dataService.mutate<
      Authenticate.Mutation,
      Authenticate.Variables
    >(AUTHENTICATE, {
      token,
    });
  }
}
