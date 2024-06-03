import { Injector } from '@nestjs/core/injector/injector';

import {
  CustomField,
  CustomFieldType,
  CustomFieldsObject,
  DefaultFormComponentId,
  UiComponentConfig,
} from '@mosaic/common';

import { RequestContext } from '../../api/common';

export type DefaultValueType<T extends CustomFieldType> = T extends 'string'
  ? string
  : T extends 'boolean'
  ? boolean
  : never;

export type BaseTypedCustomFieldConfig<
  T extends CustomFieldType,
  C extends CustomField
> = Omit<C, '__typename' | 'list' | 'requiresPermission'> & {
  type: T;
  /**
   * @description
   * Whether the custom field is available via the Shop API.
   * @default true
   */
  public?: boolean;
  nullable?: boolean;
  requiresPermission?: string;
  ui?: UiComponentConfig<DefaultFormComponentId | string>;
};

/**
 * @description
 * Configures a custom field on an entity in the {@link CustomFields} config object.
 */
export type TypedCustomSingleFieldConfig<
  T extends CustomFieldType,
  C extends CustomField
> = BaseTypedCustomFieldConfig<T, C> & {
  list?: false;
  defaultValue?: DefaultValueType<T>;
  validate?: (
    value: DefaultValueType<T>,
    injector: Injector,
    ctx: RequestContext
  ) => string | void | Promise<string | void>;
};

export type TypedCustomListFieldConfig<
  T extends CustomFieldType,
  C extends CustomField
> = BaseTypedCustomFieldConfig<T, C> & {
  list?: true;
  defaultValue?: Array<DefaultValueType<T>>;
  validate?: (value: Array<DefaultValueType<T>>) => string | void;
};

export type TypedCustomFieldConfig<
  T extends CustomFieldType,
  C extends CustomField
> = BaseTypedCustomFieldConfig<T, C> &
  (TypedCustomSingleFieldConfig<T, C> | TypedCustomListFieldConfig<T, C>);

export type StringCustomFieldConfig = TypedCustomFieldConfig<
  'string',
  CustomField
>;

export type BooleanCustomFieldConfig = TypedCustomFieldConfig<
  'boolean',
  CustomField
>;

/**
 * @description
 * An object used to configure a custom field.
 *
 * @docsCategory custom-fields
 */
export type CustomFieldConfig =
  | StringCustomFieldConfig
  | BooleanCustomFieldConfig;

/**
 * @description
 * Most entities can have additional fields added to them by defining an array of {@link CustomFieldConfig}
 * objects on against the corresponding key.
 */
export type CustomFields = {
  Address?: CustomFieldConfig[];
} & { [entity: string]: CustomFieldConfig[] };

/**
 * This interface should be implemented by any entity which can be extended
 * with custom fields.
 */
export interface HasCustomFields {
  customFields: CustomFieldsObject;
}
