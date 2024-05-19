import { MosaicEntity } from '../../data';

export type GraphQLErrorResult = {
  errorCode: string;
  message: string;
};

export type JustErrorResults<T extends GraphQLErrorResult | U, U = any> = Exclude<
  T,
  T extends GraphQLErrorResult ? never : T
>;

export type ErrorResultUnion<T extends GraphQLErrorResult | U, E extends MosaicEntity, U = any> =
  | JustErrorResults<T>
  | E;

export function isGraphQlErrorResult<T extends GraphQLErrorResult | U, U = any>(
  input: T,
): input is JustErrorResults<T>;
export function isGraphQlErrorResult<T, E extends MosaicEntity>(
  input: ErrorResultUnion<T, E>,
): input is JustErrorResults<ErrorResultUnion<T, E>> {
  return (
    input &&
    !!(
      (input as unknown as GraphQLErrorResult).errorCode &&
      (input as unknown as GraphQLErrorResult).message != null
    ) &&
    (input as any).__typename
  );
}
