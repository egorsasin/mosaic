import { EmailAddressConflictError, Maybe } from '@mosaic/common';

import {
  InvalidCredentialsError,
  NativeAuthStrategyError,
  PasswordValidationError,
} from '../common';

export declare type Success = {
  success: boolean;
};

export type CurrentUser = {
  id: number;
  identifier: string;
  verified?: boolean;
};

export type MutationAuthenticateArgs = {
  input: AuthenticationInput;
};

export type MutationLoginArgs = {
  username: string;
  password: string;
};

export type AuthenticationInput = {
  native?: Maybe<MutationLoginArgs>;
};

export type AuthenticationResult = CurrentUser | InvalidCredentialsError;

export type NativeAuthenticationResult =
  | CurrentUser
  | InvalidCredentialsError
  | NativeAuthStrategyError;

export type MutationRegisterArgs = {
  emailAddress: string;
  password: string;
};

export type RegistrationResult =
  | CurrentUser
  | EmailAddressConflictError
  | PasswordValidationError;

// Password reset

export declare type MutationRequestPasswordResetArgs = {
  emailAddress: string;
};

export declare type RequestPasswordResetResult =
  | Success
  | NativeAuthStrategyError;
