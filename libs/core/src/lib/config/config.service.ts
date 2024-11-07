import { DataSourceOptions, getMetadataArgsStorage } from 'typeorm';
import { DynamicModule, Injectable, Type } from '@nestjs/common';

import { getConfig } from './config-helpers';
import {
  ApiOptions,
  AssetOptions,
  AuthOptions,
  CatalogOptions,
  JobQueueOptions,
  MosaicConfig,
  OrderOptions,
  PaymentOptions,
  RuntimeConfig,
} from './config';
import { CustomFields } from './custom-field';

@Injectable()
export class ConfigService implements MosaicConfig {
  private activeConfig: RuntimeConfig;
  private allCustomFieldsConfig: Required<CustomFields> | undefined;

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

  public get catalogOptions(): Required<CatalogOptions> {
    return this.activeConfig.catalogOptions;
  }

  public get authOptions(): Required<AuthOptions> {
    return this.activeConfig.authOptions;
  }

  public get paymentOptions(): Required<PaymentOptions> {
    return this.activeConfig.paymentOptions;
  }

  public get jobQueueOptions(): Required<JobQueueOptions> {
    return this.activeConfig.jobQueueOptions;
  }

  public get customFields(): Required<CustomFields> {
    if (!this.allCustomFieldsConfig) {
      this.allCustomFieldsConfig = this.getCustomFieldsForAllEntities();
    }
    return this.allCustomFieldsConfig;
  }

  private getCustomFieldsForAllEntities(): Required<CustomFields> {
    const definedCustomFields = this.activeConfig.customFields;
    const metadataArgsStorage = getMetadataArgsStorage();

    if (Array.isArray(this.dbConnectionOptions.entities)) {
      for (const entity of this.dbConnectionOptions.entities) {
        if (typeof entity === 'function' && !definedCustomFields[entity.name]) {
          const hasCustomFields = !!metadataArgsStorage
            .filterEmbeddeds(entity)
            .find((c) => c.propertyName === 'customFields');

          if (hasCustomFields) {
            definedCustomFields[entity.name] = [];
          }
        }
      }
    }

    return definedCustomFields;
  }
}
