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
  constructor(public message: string) {
    super(message, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }
}

export class UserInputError extends GraphQLError {
  constructor(
    public message: string,
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
