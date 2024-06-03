import { Maybe, UiComponentConfig } from './common';

export type CustomFieldsObject = { [key: string]: unknown };

export type CustomFieldType = 'string' | 'boolean';

export type CustomField = {
  description?: string;
  internal?: boolean;
  label?: string;
  list: boolean;
  name: string;
  nullable?: boolean;
  readonly?: boolean;
  requiresPermission?: boolean;
  type: CustomFieldType;
  ui?: Maybe<UiComponentConfig<string>>;
};
