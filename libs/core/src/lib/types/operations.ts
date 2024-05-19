import {
  ConfigArgCommonDef,
  ConfigArgType,
  IntArgConfig,
  StringArgConfig,
  WithArgConfig,
} from '../common';
import { PaymentMethodHandler } from '../config';

export type ConfigArg = {
  name: string;
  value: string;
};

export type ConfigurableOperation = {
  code: string;
  args: ConfigArg[];
};

export type ConfigArgDef<T extends ConfigArgType> = T extends 'string'
  ? ConfigArgCommonDef<'string'> & StringArgConfig
  : T extends 'int'
  ? ConfigArgCommonDef<'int'> & IntArgConfig
  : ConfigArgCommonDef<T> & WithArgConfig<never>;

export type ConfigArgListDef<
  T extends ConfigArgType,
  C extends ConfigArgCommonDef<T> = ConfigArgCommonDef<T>
> = C & { list: true };

export type ConfigArgDefToType<D extends ConfigArgDef<ConfigArgType>> =
  D extends ConfigArgListDef<'int' | 'float'>
    ? number[]
    : D extends ConfigArgDef<'int' | 'float'>
    ? number
    : D extends ConfigArgListDef<'datetime'>
    ? Date[]
    : D extends ConfigArgDef<'datetime'>
    ? Date
    : D extends ConfigArgListDef<'boolean'>
    ? boolean[]
    : D extends ConfigArgDef<'boolean'>
    ? boolean
    : D extends ConfigArgListDef<'string'>
    ? string[]
    : string;

export type ConfigArgs = {
  [name: string]: ConfigArgDef<ConfigArgType>;
};

export type ConfigArgValues<T extends ConfigArgs> = {
  [K in keyof T]: ConfigArgDefToType<T[K]>;
};

export type ConfigDefTypeMap = {
  PaymentMethodHandler: PaymentMethodHandler;
};

export type ConfigDefType = keyof ConfigDefTypeMap;
