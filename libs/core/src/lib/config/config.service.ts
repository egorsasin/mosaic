import { DataSourceOptions } from 'typeorm';
import { DynamicModule, Injectable, Type } from '@nestjs/common';

import { getConfig } from './config-helpers';
import {
  ApiOptions,
  AssetOptions,
  AuthOptions,
  MosaicConfig,
  OrderOptions,
  PaymentOptions,
  RuntimeConfig,
} from './config';

@Injectable()
export class ConfigService implements MosaicConfig {
  private activeConfig: RuntimeConfig;

  constructor() {
    this.activeConfig = getConfig();
  }

  get dbConnectionOptions(): DataSourceOptions {
    return this.activeConfig.dbConnectionOptions;
  }

  public get orderOptions(): OrderOptions {
    return this.activeConfig.orderOptions;
  }

  public get plugins(): DynamicModule[] | Type<any>[] {
    return this.activeConfig.plugins;
  }

  public get assetOptions(): Required<AssetOptions> {
    return this.activeConfig.assetOptions;
  }

  public get apiOptions(): Required<ApiOptions> {
    return this.activeConfig.apiOptions;
  }

  public get authOptions(): Required<AuthOptions> {
    return this.activeConfig.authOptions;
  }

  public get paymentOptions(): Required<PaymentOptions> {
    return this.activeConfig.paymentOptions;
  }
}
