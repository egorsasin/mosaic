import { GraphQLError } from 'graphql';

export abstract class I18nError extends GraphQLError {
  protected constructor(
    public message: string,
    public variables: { [key: string]: string | number } = {},
    public code?: string
  ) {
    super(message, {
      extensions: { code },
    });
  }
}
