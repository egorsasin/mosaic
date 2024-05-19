import { DynamicModule, Type } from '@nestjs/common';
import { notNullOrUndefined } from '@mosaic/common';
import { MODULE_METADATA } from '@nestjs/common/constants';

import { ApiType } from '../api';
import { RuntimeConfig } from '../config';
import { APIExtensionDefinition } from './mosaic-plugin';

export const PLUGIN_METADATA = {
  CONFIGURATION: 'configuration',
  ENTITIES: 'entities',
  SHOP_API_EXTENSIONS: 'shopApiExtensions',
  ADMIN_API_EXTENSIONS: 'adminApiExtensions',
};

export type PluginConfigurationFn = (
  config: RuntimeConfig
) => RuntimeConfig | Promise<RuntimeConfig>;

export function getConfigurationFunction(
  plugin: DynamicModule | Type<unknown>
): PluginConfigurationFn {
  return reflectMetadata(plugin, PLUGIN_METADATA.CONFIGURATION);
}

export function isDynamicModule(
  plugin: DynamicModule | Type<unknown>
): plugin is DynamicModule {
  return !!(plugin as DynamicModule).module;
}

export function getModuleMetadata(module: Type<unknown>) {
  return {
    controllers: Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, module) || [],
    providers: Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module) || [],
    imports: Reflect.getMetadata(MODULE_METADATA.IMPORTS, module) || [],
    exports: Reflect.getMetadata(MODULE_METADATA.EXPORTS, module) || [],
  };
}

export function graphQLResolversFor(
  plugin: Type<unknown> | DynamicModule,
  apiType: ApiType
): Array<Type<unknown>> {
  const apiExtensions: APIExtensionDefinition =
    apiType === 'shop'
      ? reflectMetadata(plugin, PLUGIN_METADATA.SHOP_API_EXTENSIONS)
      : reflectMetadata(plugin, PLUGIN_METADATA.ADMIN_API_EXTENSIONS);

  return apiExtensions
    ? typeof apiExtensions.resolvers === 'function'
      ? apiExtensions.resolvers()
      : apiExtensions.resolvers ?? []
    : [];
}

export function getEntitiesFromPlugins(
  plugins?: Type<unknown>[] | DynamicModule[]
): Type<unknown>[] {
  if (!plugins) {
    return [];
  }
  return plugins
    .map((p) => reflectMetadata(p, PLUGIN_METADATA.ENTITIES))
    .reduce((all, entities) => {
      const resolvedEntities =
        typeof entities === 'function' ? entities() : entities ?? [];
      return [...all, ...resolvedEntities];
    }, []);
}

export function getPluginAPIExtensions(
  plugins: Array<Type<unknown> | DynamicModule>,
  apiType: ApiType
): APIExtensionDefinition[] {
  const extensionKey =
    apiType === 'shop'
      ? PLUGIN_METADATA.SHOP_API_EXTENSIONS
      : PLUGIN_METADATA.ADMIN_API_EXTENSIONS;
  const extensions = plugins.map((p) => reflectMetadata(p, extensionKey));

  return extensions.filter(notNullOrUndefined);
}

function reflectMetadata(
  plugin: DynamicModule | Type<unknown>,
  metadataKey: string
) {
  const reflector = isDynamicModule(plugin) ? plugin.module : plugin;
  return Reflect.getMetadata(metadataKey, reflector);
}
