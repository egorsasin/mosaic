import { InMemoryCache } from '@apollo/client/core';

import { GET_USER_STATUS } from './client.definitions';
import {
  SetAsLoggedInVariable,
  UserStatus,
  UserStatusQuery,
} from './client.types';

export type ResolverContext = {
  cache: InMemoryCache;
};

export type ResolverDefinition = {
  Mutation: {
    [name: string]: (
      rootValue: unknown,
      args: any,
      context: ResolverContext
    ) => unknown;
  };
};

export const clientResolvers: ResolverDefinition = {
  Mutation: {
    setAsLoggedIn: (_, args: SetAsLoggedInVariable, { cache }) => {
      const {
        input: { username, loginTime },
      } = args;
      const data: UserStatusQuery = {
        userStatus: {
          __typename: 'UserStatus',
          username,
          loginTime,
          isLoggedIn: true,
        },
      };
      cache.writeQuery({ query: GET_USER_STATUS, data });
      return data.userStatus;
    },
    setAsLoggedOut: (_, args, { cache }): UserStatus => {
      const data: UserStatusQuery = {
        userStatus: {
          __typename: 'UserStatus',
          username: '',
          loginTime: '',
          isLoggedIn: false,
        },
      };
      cache.writeQuery({ query: GET_USER_STATUS, data });
      return data.userStatus;
    },
  },
};
