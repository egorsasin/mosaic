import { GraphQLError } from 'graphql';

import { MosaicEntity } from '../../data';

export type JustErrorResults<T extends GraphQLError | U, U = unknown> = Exclude<
  T,
  T extends GraphQLError ? never : T
>;

export type ErrorResultUnion<
  T extends GraphQLError | U,
  E extends MosaicEntity,
  U = unknown
> = JustErrorResults<T> | E;

export function isGraphQlErrorResult<T extends GraphQLError | U, U = unknown>(
  input: T
): input is JustErrorResults<T>;
export function isGraphQlErrorResult<T, E extends MosaicEntity>(
  input: ErrorResultUnion<T, E>
): input is JustErrorResults<ErrorResultUnion<T, E>> {
  return input && !!((input as unknown as GraphQLError).message != null);
}
