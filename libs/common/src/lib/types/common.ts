export type Maybe<T> = T | null;

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum DeletionResult {
  /** The entity was successfully deleted */
  DELETED = 'DELETED',
  /** Deletion did not take place, reason given in message */
  NOT_DELETED = 'NOT_DELETED',
}

export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};

export type MutationArgs<T> = Exact<{
  input: T;
}>;

export type DefaultFormComponentId =
  | 'boolean-form-input'
  | 'select-form-input'
  | 'textarea-form-input'
  | 'text-form-input'
  | 'product-selector-form-input'
  | 'product-multi-form-input';

interface DefaultFormConfigHash
  extends Record<DefaultFormComponentId, unknown> {
  'select-form-input': {
    options?: {
      value: string;
      label?: string;
    }[];
  };
  'text-form-input': {
    prefix?: string;
    suffix?: string;
  };
  'textarea-form-input': {
    spellcheck?: boolean;
  };
  'product-multi-form-input': {
    selectionMode?: 'product' | 'variant';
  };
}

export type DefaultFormComponentUiConfig<
  T extends DefaultFormComponentId | string
> = T extends DefaultFormComponentId ? DefaultFormConfigHash[T] : unknown;

export type DefaultFormComponentConfig<
  T extends DefaultFormComponentId | string
> = DefaultFormComponentUiConfig<T> & {
  ui?: DefaultFormComponentUiConfig<T>;
};

export type UiComponentConfig<T extends DefaultFormComponentId | string> =
  T extends DefaultFormComponentId
    ? {
        component: T;
        tab?: string;
      } & DefaultFormConfigHash[T]
    : {
        component: string;
        tab?: string;
        [prop: string]: unknown;
      };

export type ConfigArgDefinition = {
  defaultValue?: Maybe<string>;
  description?: Maybe<string>;
  label?: Maybe<string>;
  list: boolean;
  name: string;
  required: boolean;
  type: string;
  ui?: Maybe<UiComponentConfig<string>>;
};

export type ConfigurableOperationDefinition = {
  args: ConfigArgDefinition[];
  code: string;
  description: string;
};

export type QueryListArgs<T> = {
  options?: Maybe<T>;
};

export interface PaginatedList<T> {
  items: T[];
  totalItems: number;
}

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

export type Success = {
  success: boolean;
};
