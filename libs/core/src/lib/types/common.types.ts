import {
  Maybe,
  LogicalOperator,
  SortOrder,
  NullOptionals,
  StringOperators,
  NumberOperators,
  BooleanOperators,
  DateOperators,
  ErrorCode,
} from '@mosaic/common';

import { MosaicEntity } from '../data';

export type PayloadArgs<T> = {
  input: T;
};

export type ErrorResult = {
  errorCode: ErrorCode;
  message: string;
};

export enum CurrencyCode {
  PLN = 'PLN',
  USD = 'USD',
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
