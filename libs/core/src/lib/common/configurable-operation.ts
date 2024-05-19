import {
  ConfigArgDefinition,
  ConfigurableOperationDefinition,
  Maybe,
  UiComponentConfig,
  assertNever,
} from '@mosaic/common';

import { ConfigArg, ConfigArgValues } from '../types';

import { InternalServerError } from './error/errors';
import { InjectableStrategy } from './injectable-strategy';

export type ConfigArgType = 'string' | 'int' | 'float' | 'boolean' | 'datetime';

export type ConfigArgTypeToTsType<T extends ConfigArgType> = T extends 'string'
  ? string
  : T extends 'int'
  ? number
  : T extends 'float'
  ? number
  : T extends 'boolean'
  ? boolean
  : Date;

export type WithArgConfig<T> = {
  config?: T;
};

export type IntArgConfig = WithArgConfig<{
  inputType?: 'default' | 'percentage' | 'money';
}>;

export type StringArgConfig = WithArgConfig<{
  options?: Maybe<string[]>;
}>;

export interface ConfigArgCommonDef<T extends ConfigArgType> {
  type: T;
  required?: boolean;
  defaultValue?: ConfigArgTypeToTsType<T>;
  list?: boolean;
  label?: string;
  description?: string;
  ui?: UiComponentConfig<string>;
}

export type ConfigArgDef<T extends ConfigArgType> = T extends 'string'
  ? ConfigArgCommonDef<'string'> & StringArgConfig
  : T extends 'int'
  ? ConfigArgCommonDef<'int'> & IntArgConfig
  : ConfigArgCommonDef<T> & WithArgConfig<never>;

export type ConfigArgs = {
  [name: string]: ConfigArgDef<ConfigArgType>;
};

export interface ConfigurableOperationDefOptions<T extends ConfigArgs>
  extends InjectableStrategy {
  code: string;
  args: T;
  description: string;
}

function coerceValueToType<T extends ConfigArgs>(
  value: string,
  type: ConfigArgType,
  isList: boolean
): ConfigArgValues<T>[keyof T] {
  if (isList) {
    try {
      return (JSON.parse(value) as string[]).map((v) =>
        coerceValueToType(v, type, false)
      ) as ConfigArgValues<T>[keyof T];
    } catch (err) {
      throw new InternalServerError(
        `Could not parse list value "${value}": ` + JSON.stringify(err.message)
      );
    }
  }
  switch (type) {
    case 'string':
      return value as ConfigArgValues<T>[keyof T];
    case 'int':
      return Number.parseInt(value || '', 10) as ConfigArgValues<T>[keyof T];
    case 'float':
      return Number.parseFloat(value || '') as ConfigArgValues<T>[keyof T];
    case 'datetime':
      return Date.parse(value || '') as ConfigArgValues<T>[keyof T];
    case 'boolean':
      return !!(
        value &&
        (value.toLowerCase() === 'true' || value === '1')
      ) as ConfigArgValues<T>[keyof T];
    default:
      assertNever(type);
  }
}

export class ConfigurableOperationDef<T extends ConfigArgs = ConfigArgs> {
  get code(): string {
    return this.options.code;
  }
  get args(): T {
    return this.options.args;
  }
  get description(): string {
    return this.options.description;
  }
  constructor(protected options: ConfigurableOperationDefOptions<T>) {}

  public toGraphQlType(): ConfigurableOperationDefinition {
    return {
      code: this.code,
      description: this.description,
      args: Object.entries(this.args).map(
        ([name, arg]) =>
          ({
            name,
            type: arg.type,
            list: arg.list ?? false,
            required: arg.required ?? true,
            defaultValue: arg.defaultValue,
            ui: arg.ui,
            label: arg.label,
            description: arg.description,
          } as Required<ConfigArgDefinition>)
      ),
    };
  }

  protected argsArrayToHash(args: ConfigArg[]): ConfigArgValues<T> {
    const output: ConfigArgValues<T> = {} as ConfigArgValues<T>;
    for (const arg of args) {
      if (arg && arg.value != null && this.args[arg.name] != null) {
        output[arg.name as keyof ConfigArgValues<T>] = coerceValueToType<T>(
          arg.value,
          this.args[arg.name].type,
          this.args[arg.name].list || false
        );
      }
    }
    return output;
  }
}
