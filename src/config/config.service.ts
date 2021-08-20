import { DynamicModule, Injectable, Type } from '@nestjs/common';
import { getConfig } from './config-helpers';
import {
  ApiOptions,
  MediaOptions,
  MosaicConfig,
  RuntimeConfig,
} from './config';

@Injectable()
export class ConfigService implements MosaicConfig {
  private activeConfig: RuntimeConfig;

  constructor() {
    this.activeConfig = getConfig();
  }

  public get mediaOptions(): Required<MediaOptions> {
    return this.activeConfig.mediaOptions;
  }

  public get plugins(): DynamicModule[] | Type<any>[] {
    return this.activeConfig.plugins;
  }

  public get apiOptions(): ApiOptions {
    return this.activeConfig.apiOptions;
  }
}
