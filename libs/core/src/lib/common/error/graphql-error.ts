import { GraphQLError } from 'graphql';

import { OrderState } from '../../types';

export class ErrorResult {
  public readonly __typename: string;
  public readonly errorCode: string;
  public message: string;
}

export class NativeAuthStrategyError extends ErrorResult {
  readonly __typename = 'NativeAuthStrategyError';
  readonly errorCode = 'NATIVE_AUTH_STRATEGY_ERROR';
  readonly message = 'NATIVE_AUTH_STRATEGY_ERROR';
}

export class PasswordValidationError extends ErrorResult {
  readonly __typename = 'PasswordValidationError';
  readonly errorCode = 'PASSWORD_VALIDATION_ERROR' as any;
  readonly message = 'PASSWORD_VALIDATION_ERROR';
  constructor(public validationErrorMessage: string) {
    super();
  }
}

export class NegativeQuantityError extends ErrorResult {
  readonly __typename = 'NegativeQuantityError';
  readonly errorCode = 'NEGATIVE_QUANTITY_ERROR' as any;
  readonly message = 'NEGATIVE_QUANTITY_ERROR';
}

export class OrderLimitError extends ErrorResult {
  readonly __typename = 'OrderLimitError';
  readonly errorCode = 'ORDER_LIMIT_ERROR';
  public readonly message = 'ORDER_LIMIT_ERROR';
  public readonly maxItems: number;

  constructor(input: { maxItems: number }) {
    super();
    this.maxItems = input.maxItems;
  }
}

export class PaymentStateTransitionError extends ErrorResult {
  readonly __typename = 'PaymentStateTransitionError';
  readonly errorCode = 'PAYMENT_STATE_TRANSITION_ERROR';
  readonly message = 'PAYMENT_STATE_TRANSITION_ERROR';
  readonly fromState: string;
  readonly toState: string;
  readonly transitionError: string;

  constructor({
    fromState,
    toState,
    transitionError,
  }: {
    fromState: string;
    toState: string;
    transitionError: string;
  }) {
    super();
    this.fromState = fromState;
    this.toState = toState;
    this.transitionError = transitionError;
  }
}

/** Returned if there is an error in transitioning the Order state */
export class OrderStateTransitionError extends GraphQLError {
  public readonly errorCode = 'ORDER_STATE_TRANSITION_ERROR';
  public readonly maxItems: number;

  constructor(
    public readonly transitionError: string,
    public readonly fromState: OrderState,
    public readonly toState: OrderState
  ) {
    super('ORDER_STATE_TRANSITION_ERROR');
  }
}

const errorTypeNames = new Set([
  'InvalidCredentialsError',
  'NotVerifiedError',
  'OrderStateTransitionError',
  'NativeAuthStrategyError',
  'PasswordValidationError',
  'EmailAddressConflictError',
  'OrderLimitError',
  'PasswordValidationError',
  'NegativeQuantityError',
  'NoActiveOrderError',
  'OrderModificationError',
  'PaymentStateTransitionError',
]);

export type GraphQLValue = { __typename: string };

export function isGraphQLError(input: GraphQLValue): input is ErrorResult {
  return input instanceof ErrorResult || errorTypeNames.has(input.__typename);
}

export const errorOperationTypeResolvers = {
  AuthenticationResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'CurrentUser';
    },
  },
  NativeAuthenticationResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'CurrentUser';
    },
  },
  RegistrationResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'CurrentUser';
    },
  },
  RequestPasswordResetResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'Success';
    },
  },
};

export const storeFrontErrorTypeResolvers = {
  UpdateOrderItemsResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'Order';
    },
  },

  AddPaymentToOrderResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'Order';
    },
  },

  RemoveOrderItemResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'Order';
    },
  },

  SetOrderShippingMethodResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'Order';
    },
  },

  ActiveOrderResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'Order';
    },
  },

  SetCustomerForOrderResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'Order';
    },
  },
};

export const adminErrorTypeResolvers = {
  CheckSlugResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'Success';
    },
  },
};
