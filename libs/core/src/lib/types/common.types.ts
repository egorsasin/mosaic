import { Maybe } from '@mosaic/common';

export type PayloadArgs<T> = {
  input: T;
};

export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  MIME_TYPE_ERROR = 'MIME_TYPE_ERROR',
}

export type ErrorResult = {
  errorCode: ErrorCode;
  message: string;
};

export enum CurrencyCode {
  PLN = 'PLN',
  USD = 'USD',
}

export type PaginatedList<T> = {
  items: T[];
  totalItems: number;
};

export interface ListQueryOptions {
  take?: Maybe<number>;
  skip?: Maybe<number>;
}

export type QueryListArgs = {
  options?: Maybe<ListQueryOptions>;
};

export type QueryProductArgs = {
  id?: number;
  slug?: string;
};

export type PaymentMetadata = {
  [prop: string]: unknown;
} & {
  public?: unknown;
};
