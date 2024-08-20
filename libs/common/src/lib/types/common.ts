export type Maybe<T> = T | null;

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
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
  | 'text-form-input';

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
  args: Array<ConfigArgDefinition>;
  code: string;
  description: string;
};
