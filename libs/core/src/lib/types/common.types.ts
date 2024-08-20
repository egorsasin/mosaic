import { Maybe, LogicalOperator, SortOrder } from '@mosaic/common';

import { MosaicEntity } from '../data';

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

export interface StringOperators {
  eq?: string;
  notEq?: string;
  contains?: string;
  notContains?: string;
  in?: string[];
  notIn?: string[];
  regex?: string;
  isNull?: boolean;
}

export interface BooleanOperators {
  eq?: boolean;
  isNull?: boolean;
}

export interface NumberRange {
  start: number;
  end: number;
}

export interface NumberOperators {
  eq?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  between?: NumberRange;
  isNull?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateOperators {
  eq?: Date;
  before?: Date;
  after?: Date;
  between?: DateRange;
  isNull?: boolean;
}

export interface ListOperators {
  inList?: string | number | boolean | Date;
}

// prettier-ignore
export type PrimitiveFields<T extends MosaicEntity> = {
    [K in keyof T]: NonNullable<T[K]> extends number | string | boolean | Date ? K : never
}[keyof T];

// prettier-ignore
export type SortParameter<T extends MosaicEntity> = {
    [K in PrimitiveFields<T>]?: SortOrder
};

// prettier-ignore
export type FilterParameter<T extends MosaicEntity> = {
    [K in PrimitiveFields<T>]?: T[K] extends string ? StringOperators
        : T[K] extends number ? NumberOperators
            : T[K] extends boolean ? BooleanOperators
                : T[K] extends Date ? DateOperators : StringOperators;
} & {
    _and?: Array<FilterParameter<T>>;
    _or?: Array<FilterParameter<T>>;
};

/**
 * Returns a type T where any optional fields also have the "null" type added.
 * This is needed to provide interop with the Apollo-generated interfaces, where
 * nullable fields have the type `field?: <type> | null`.
 */
export type NullOptionals<T> = {
  [K in keyof T]: undefined extends T[K]
    ? NullOptionals<T[K]> | null
    : NullOptionals<T[K]>;
};

export interface ListQueryOptions<T extends MosaicEntity> {
  take?: number | null;
  skip?: number | null;
  sort?: NullOptionals<SortParameter<T>> | null;
  filter?: NullOptionals<FilterParameter<T>> | null;
  filterOperator?: LogicalOperator;
}

export type QueryListArgs<T extends MosaicEntity = MosaicEntity> = {
  options?: Maybe<ListQueryOptions<T>>;
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
