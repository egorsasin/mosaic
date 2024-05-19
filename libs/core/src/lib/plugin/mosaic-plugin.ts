import { DocumentNode } from 'graphql';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  Module,
  ModuleMetadata,
  Provider,
  Type as NestType,
} from '@nestjs/common';
import { MODULE_METADATA } from '@nestjs/common/constants';

import { pick } from '@mosaic/common';

import { PluginConfigurationFn, PLUGIN_METADATA } from './plugin-metadata';

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface APIExtensionDefinition {
  schema?: DocumentNode | (() => DocumentNode | undefined);
  resolvers: Array<Type<unknown>> | (() => Array<Type<unknown>>);
}

export interface MosaicPluginMetadata extends ModuleMetadata {
  configuration?: PluginConfigurationFn;
  shopApiExtensions?: APIExtensionDefinition;
  adminApiExtensions?: APIExtensionDefinition;
  entities?: Array<Type<any>> | (() => Array<Type<any>>);
}

export function MosaicPlugin(
  pluginMetadata: MosaicPluginMetadata
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    for (const metadataProperty of Object.values(PLUGIN_METADATA)) {
      const property = metadataProperty as keyof MosaicPluginMetadata;

      if (pluginMetadata[property] != null) {
        Reflect.defineMetadata(property, pluginMetadata[property], target);
      }
    }
    const nestModuleMetadata = pick(
      pluginMetadata,
      Object.values(MODULE_METADATA) as any
    );
    const nestGlobalProviderTokens = [
      APP_INTERCEPTOR,
      APP_FILTER,
      APP_GUARD,
      APP_PIPE,
    ];
    const exportedProviders = (nestModuleMetadata.providers || []).filter(
      (provider) => {
        if (isNamedProvider(provider)) {
          if (nestGlobalProviderTokens.includes(provider.provide as any)) {
            return false;
          }
        }
        return true;
      }
    );
    nestModuleMetadata.exports = [
      ...(nestModuleMetadata.exports || []),
      ...exportedProviders,
    ];

    Module(nestModuleMetadata)(target);
  };
}

function isNamedProvider(
  provider: Provider
): provider is Exclude<Provider, NestType<any>> {
  return provider.hasOwnProperty('provide');
}
