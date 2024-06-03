import { DataSourceOptions } from 'typeorm';
import { DynamicModule, Type } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { PaymentProcess } from '../service/helpers';

import {
  AuthenticationStrategy,
  PasswordHashingStrategy,
  PasswordValidationStrategy,
} from './auth';
import { SessionCacheStrategy } from './session';
import { PaymentMethodHandler } from './payment';
import { OrderProcess, OrderPlacedStrategy } from './order';
import {
  AssetNamingStrategy,
  AssetPreviewStrategy,
  AssetStorageStrategy,
} from './asset';
import { MoneyStrategy } from './entity';
import { CustomFields } from './custom-field';

export interface ApiOptions {
  port: number;
  cors?: boolean | CorsOptions;
}

export interface OrderOptions {
  orderItemsLimit?: number;
  orderLineItemsLimit?: number;
  process?: Array<OrderProcess<any>>;
  orderPlacedStrategy?: OrderPlacedStrategy;
}

export interface AuthOptions {
  disableAuth?: boolean;
  requireVerification?: boolean;
  authTokenHeaderKey?: string;
  authenticationStrategy?: AuthenticationStrategy[];
  passwordHashingStrategy?: PasswordHashingStrategy;
  passwordValidationStrategy?: PasswordValidationStrategy;
  sessionCacheStrategy?: SessionCacheStrategy;
  sessionDuration?: string | number;
  sessionCacheTTL?: number;
}

export interface AssetOptions {
  assetNamingStrategy?: AssetNamingStrategy;
  assetStorageStrategy?: AssetStorageStrategy;
  assetPreviewStrategy?: AssetPreviewStrategy;
  permittedFileTypes?: string[];
  uploadMaxFileSize?: number;
}

export interface PaymentOptions {
  paymentMethodHandlers: PaymentMethodHandler[];
  process?: PaymentProcess[];
}

export interface EntityOptions {
  moneyStrategy?: MoneyStrategy;
}

export interface MosaicConfig {
  apiOptions: ApiOptions;
  assetOptions?: AssetOptions;
  authOptions?: AuthOptions;
  dbConnectionOptions?: DataSourceOptions;
  plugins?: DynamicModule[] | Type<unknown>[];
  paymentOptions: PaymentOptions;
  entityOptions?: EntityOptions;
}

export interface RuntimeConfig extends Required<MosaicConfig> {
  apiOptions: Required<ApiOptions>;
  assetOptions: Required<AssetOptions>;
  authOptions: Required<AuthOptions>;
  orderOptions: Required<OrderOptions>;
  paymentOptions: Required<PaymentOptions>;
  entityOptions: Required<EntityOptions>;
  customFields: Required<CustomFields>;
}

export type PartialMosaicConfig = DeepPartialSimple<MosaicConfig>;

type DeepPartialSimple<T> = {
  [P in keyof T]?:
    | null
    | (T[P] extends Array<infer U>
        ? Array<DeepPartialSimple<U>>
        : T[P] extends ReadonlyArray<infer X>
        ? ReadonlyArray<DeepPartialSimple<X>>
        : T[P] extends Type<any>
        ? T[P]
        : DeepPartialSimple<T[P]>);
};
