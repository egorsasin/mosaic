import { DynamicModule, Type } from '@nestjs/common';

import { notNullOrUndefined } from '@mosaic/common';

import { getConfig } from '../config/config-helpers';
import {
  getModuleMetadata,
  graphQLResolversFor,
  isDynamicModule,
} from './plugin-metadata';
import { ApiType } from '../api';

const dynamicApiModuleClassMap: { [name: string]: Type<unknown> } = {};

/**
 * Функция динамически создает Nest модуль для GraphQL резолверов
 * определеных в конфигурации плагина
 */
export function createDynamicGraphQlModulesForPlugins(
  apiType: ApiType
): DynamicModule[] {
  return getConfig()
    .plugins.map((plugin) => {
      const pluginModule = isDynamicModule(plugin) ? plugin.module : plugin;
      const resolvers = graphQLResolversFor(plugin, apiType) || [];

      if (resolvers.length) {
        const className = dynamicClassName(pluginModule, apiType);

        dynamicApiModuleClassMap[className] = class {};
        Object.defineProperty(dynamicApiModuleClassMap[className], 'name', {
          value: className,
        });

        const { imports } = getModuleMetadata(pluginModule);

        return {
          module: dynamicApiModuleClassMap[className],
          imports: [pluginModule, ...imports],
          providers: [...resolvers],
        };
      }
    })
    .filter(notNullOrUndefined);
}

function dynamicClassName(module: Type<unknown>, apiType: ApiType): string {
  return (
    module.name + 'Dynamic' + (apiType === 'shop' ? 'Shop' : 'Admin') + 'Module'
  );
}
