import { Exact } from '@mosaic/common';

export type AttemptLoginMutation = {
  login: {
    id: string;
  };
};

export type AttemptLoginMutationVariables = Exact<{
  username: string;
  password: string;
}>;
