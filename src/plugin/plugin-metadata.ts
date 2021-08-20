import { DynamicModule, Type } from '@nestjs/common';
import { PluginConfigurationFn } from './plugin';

export const PLUGIN_METADATA = {
  CONFIGURATION: 'configuration',
};

export function getConfigurationFunction(plugin: DynamicModule | Type<any>): PluginConfigurationFn {
  return reflectMetadata(plugin, PLUGIN_METADATA.CONFIGURATION);
}

function reflectMetadata(plugin: DynamicModule | Type<any>, metadataKey: string): PluginConfigurationFn {
  const reflector = isDynamicModule(plugin) ? plugin.module : plugin;
  return Reflect.getMetadata(metadataKey, reflector);
}

function isDynamicModule(plugin: DynamicModule | Type<any>): plugin is DynamicModule {
  return !!(plugin as DynamicModule).module;
}
