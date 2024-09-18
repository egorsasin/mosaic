import { Exact } from '@mosaic/common';

export type AttemptLoginMutation = {
  login: {
    __typename: 'CurrentUser';
    id: string;
  };
};

export type AttemptLoginMutationVariables = Exact<{
  username: string;
  password: string;
}>;

export type CurrentUserQuery = {
  me?: {
    __typename?: 'CurrentUser';
    id: string;
  } | null;
};
