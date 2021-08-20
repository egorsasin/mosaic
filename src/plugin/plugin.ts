import { Module, ModuleMetadata, Provider, Type as NestType, Type } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MODULE_METADATA } from '@nestjs/common/constants';

import { pick } from './pick';
import { PLUGIN_METADATA } from './plugin-metadata';
import { RuntimeConfig } from '../config';

export type PluginConfigurationFn = (config: RuntimeConfig) => RuntimeConfig | Promise<RuntimeConfig>;

export interface MosaicPluginMetadata extends ModuleMetadata {
  configuration?: PluginConfigurationFn;
}

export function MosaicPlugin(pluginMetadata: MosaicPluginMetadata): ClassDecorator {
  return (target: Function) => {
    Object.values(PLUGIN_METADATA).forEach((metadataProperty) => {
      const property = metadataProperty as keyof MosaicPluginMetadata;
      if (pluginMetadata[property] != null) {
        Reflect.defineMetadata(property, pluginMetadata[property], target);
      }
    });

    const nestModuleMetadata = pick(pluginMetadata, Object.values(MODULE_METADATA) as any);
    const nestGlobalProviderTokens = [APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE];

    const exportedProviders = (nestModuleMetadata.providers || []).filter((provider) => {
      if (isNamedProvider(provider)) {
        if (nestGlobalProviderTokens.includes(provider.provide as any)) {
          return false;
        }
      }
      return true;
    });

    nestModuleMetadata.exports = [...(nestModuleMetadata.exports || []), ...exportedProviders];
    Module(nestModuleMetadata)(target);
  };
}

function isNamedProvider(provider: Provider): provider is Exclude<Provider, NestType<any>> {
  return provider.hasOwnProperty('provide');
}
