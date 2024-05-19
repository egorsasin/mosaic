import { Maybe } from 'graphql/jsutils/Maybe';

export type CurrentUser = {
  __typename?: 'CurrentUser';
  id: number;
  identifier: string;
  lastName: string;
};

export type ErrorResult = {
  __typename?: 'InvalidCredentialsError' | 'NativeAuthStrategyError';
  errorCode?: string;
  message: string;
};

export type AttemptLoginMutation = { login: CurrentUser | ErrorResult };

export type AttemptLoginMutationVariables = {
  username: string;
  password: string;
};

export namespace AttemptLogin {
  export type Mutation = AttemptLoginMutation;
  export type Variables = AttemptLoginMutationVariables;
  export type Login = NonNullable<AttemptLoginMutation>['login'];
}

export type RegisterResult = CurrentUser | ErrorResult;

export type CurrentUserQuery = { me?: Maybe<CurrentUser> };

export namespace PasswordResetRequest {
  export type Mutation = { sucess: boolean | ErrorResult };
  export type Variables = { emailAddress: string };
}
