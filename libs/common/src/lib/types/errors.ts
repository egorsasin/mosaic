import { GraphQLError } from 'graphql';

export class UnauthorizedError extends GraphQLError {
  constructor() {
    super('error.unauthorized', { extensions: { code: 'UNAUTHORIZED' } });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor() {
    super('error.forbidden', { extensions: { code: 'FORBIDDEN' } });
  }
}

export class InternalServerError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }
}

export class UserInputError extends GraphQLError {
  constructor(
    message: string,
    public variables: { [key: string]: string | number } = {}
  ) {
    super(message, {
      extensions: { code: 'USER_INPUT_ERROR' },
    });
  }
}

export class MimeTypeError extends GraphQLError {
  public readonly fileName: string;
  public readonly mimeType: string;

  constructor({ fileName, mimeType }: { fileName: string; mimeType: string }) {
    const code = 'MIME_TYPE_ERROR';
    super(code, {
      extensions: { code: 'USER_INPUT_ERROR' },
    });
    this.fileName = fileName;
    this.mimeType = mimeType;
  }
}

export class AlreadyLoggedInError extends GraphQLError {
  constructor() {
    super('ALREADY_LOGGED_IN_ERROR', {
      extensions: { code: 'ALREADY_LOGGED_IN_ERROR' },
    });
  }
}

export class InvalidCredentialsError extends GraphQLError {
  constructor(public authenticationError: string) {
    super('INVALID_CREDENTIALS_ERROR', {
      extensions: { code: 'INVALID_CREDENTIALS_ERROR' },
    });
  }
}

export class NotVerifiedError extends GraphQLError {
  constructor() {
    super('NOT_VERIFIED_ERROR', {
      extensions: { code: 'NOT_VERIFIED_ERROR' },
    });
  }
}

/* PAYMENT */

export class PaymentDeclinedError extends GraphQLError {
  constructor(message = '') {
    super(message, {
      extensions: { code: 'PAYMENT_DECLINED_ERROR' },
    });
  }
}

export class PaymentFailedError extends GraphQLError {
  constructor(message = '') {
    super(message, {
      extensions: { code: 'PAYMENT_FAILED_ERROR' },
    });
  }
}

/* ORDER */

export class GuestCheckoutError extends GraphQLError {
  constructor() {
    super('GUEST_CHECKOUT_ERROR', {
      extensions: { code: 'GUEST_CHECKOUT_ERROR' },
    });
  }
}

export class EmailAddressConflictError extends GraphQLError {
  constructor() {
    super('EMAIL_ADDRESS_CONFLICT_ERROR', {
      extensions: { code: 'EMAIL_ADDRESS_CONFLICT_ERROR' },
    });
  }
}

export class OrderPaymentStateError extends GraphQLError {
  constructor() {
    super('ORDER_PAYMENT_STATE_ERROR', {
      extensions: { code: 'ORDER_PAYMENT_STATE_ERROR' },
    });
  }
}

export class NoActiveOrderError extends GraphQLError {
  constructor() {
    super('NO_ACTIVE_ORDER_ERROR', {
      extensions: { code: 'NO_ACTIVE_ORDER_ERROR' },
    });
  }
}

export class IneligibleShippingMethodError extends GraphQLError {
  constructor() {
    super('INELIGIBLE_SHIPPING_METHODS_ERROR', {
      extensions: { code: 'INELIGIBLE_SHIPPING_METHODS_ERROR' },
    });
  }
}

export class OrderModificationError extends GraphQLError {
  constructor() {
    super('ORDER_MODIFICATION_ERROR', {
      extensions: { code: 'ORDER_MODIFICATION_ERROR' },
    });
  }
}
