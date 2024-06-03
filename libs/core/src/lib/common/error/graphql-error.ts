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

export class NotVerifiedError extends ErrorResult {
  readonly __typename = 'NotVerifiedError';
  readonly errorCode = 'NOT_VERIFIED_ERROR';
  readonly message = 'NOT_VERIFIED_ERROR';
}

export class InvalidCredentialsError extends ErrorResult {
  readonly __typename = 'InvalidCredentialsError';
  readonly errorCode = 'INVALID_CREDENTIALS_ERROR';
  readonly message = 'INVALID_CREDENTIALS_ERROR';

  constructor(public authenticationError: string) {
    super();
  }
}

export class EmailAddressConflictError extends ErrorResult {
  readonly __typename = 'EmailAddressConflictError';
  readonly errorCode = 'EMAIL_ADDRESS_CONFLICT_ERROR';
  readonly message = 'EMAIL_ADDRESS_CONFLICT_ERROR';
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

/** Returned when attempting to modify the contents of an Order that is not in the `AddingItems` state. */
export class OrderModificationError extends ErrorResult {
  readonly __typename = 'OrderModificationError';
  readonly errorCode = 'ORDER_MODIFICATION_ERROR';
  readonly message = 'ORDER_MODIFICATION_ERROR';
}

export class OrderLimitError extends ErrorResult {
  readonly errorCode = 'ORDER_LIMIT_ERROR';
  public readonly message = 'ORDER_LIMIT_ERROR';
  public readonly maxItems: number;

  constructor(input: { maxItems: number }) {
    super();
    this.maxItems = input.maxItems;
  }
}

/** Returned if there is an error in transitioning the Order state */
export type OrderStateTransitionError = ErrorResult & {
  __typename: 'OrderStateTransitionError';
  errorCode: 'ORDER_STATE_TRANSITION_ERROR';
  fromState: string;
  message: string;
  toState: string;
  transitionError: string;
};

const errorTypeNames = new Set([
  'InvalidCredentialsError',
  'NotVerifiedError',
  'NativeAuthStrategyError',
  'PasswordValidationError',
  'EmailAddressConflictError',
  'PasswordValidationError',
  'NegativeQuantityError',
  'NoActiveOrderError',
  'OrderModificationError',
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
};

export const adminErrorTypeResolvers = {
  CheckSlugResult: {
    __resolveType(value: GraphQLValue) {
      return isGraphQLError(value) ? value.__typename : 'Success';
    },
  },
};
