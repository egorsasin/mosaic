import {
  ConfigArg,
  ConfigurableOperationInput,
} from './configurable-operation';
import { ErrorCode, ErrorResult } from './errors';
import { Payment } from './order';

export type CreatePaymentMethodInput = {
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  handler: ConfigurableOperationInput;
};

export type CreatePaymentMethodMutation = {
  createPaymentMethod: {
    id: string;
    name: string;
    code: string;
    description: string;
    enabled: boolean;
    handler: {
      code: string;
      args: ConfigArg[];
    };
  };
};

export type PaymentMethodQuote = {
  code: string;
  customFields?: string;
  description: string;
  eligibilityMessage?: string;
  id: number;
  isEligible: boolean;
  name: string;
};

export type PaymentStateTransitionError = ErrorResult & {
  __typename?: 'PaymentStateTransitionError';
  errorCode: ErrorCode;
  fromState: string;
  message: string;
  toState: string;
  transitionError: string;
};

export type TransitionPaymentToStateResult =
  | Payment
  | PaymentStateTransitionError;
