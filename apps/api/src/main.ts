import { EntitySubscriberInterface } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import {
  DynamicModule,
  InternalServerErrorException,
  Type,
  Logger,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import {
  getConfig,
  MosaicConfig,
  RuntimeConfig,
  setConfig,
  setMoneyStrategy,
} from '@mosaic/core/config';
import { coreEntitiesMap, coreSubscribersMap } from '@mosaic/core/data';
import {
  getConfigurationFunction,
  getEntitiesFromPlugins,
} from '@mosaic/core/plugin';

import { appConfig } from './config';

async function runPluginConfigurations(
  config: RuntimeConfig
): Promise<RuntimeConfig> {
  const { plugins } = config;
  plugins.forEach(async (plugin: DynamicModule | Type<unknown>) => {
    const configFn = getConfigurationFunction(plugin);
    if (typeof configFn === 'function') {
      config = await configFn(config);
    }
  });
  return config;
}

function setExposedHeaders(config: Readonly<RuntimeConfig>) {
  const { authTokenHeaderKey } = config.authOptions;
  const corsOptions = config.apiOptions.cors;

  if (typeof corsOptions !== 'boolean') {
    const { exposedHeaders } = corsOptions;
    let exposedHeadersWithAuthKey: string[];
    if (!exposedHeaders) {
      exposedHeadersWithAuthKey = [authTokenHeaderKey];
    } else if (typeof exposedHeaders === 'string') {
      exposedHeadersWithAuthKey = exposedHeaders
        .split(',')
        .map((x) => x.trim())
        .concat(authTokenHeaderKey);
    } else {
      exposedHeadersWithAuthKey = exposedHeaders.concat(authTokenHeaderKey);
    }
    corsOptions.exposedHeaders = exposedHeadersWithAuthKey;
  }
}

export async function getAllEntities(
  userConfig: Partial<MosaicConfig>
): Promise<Type<unknown>[]> {
  const coreEntities = Object.values(coreEntitiesMap) as Type<unknown>[];
  const pluginEntities = getEntitiesFromPlugins(userConfig.plugins);

  const allEntities: Array<Type<unknown>> = coreEntities;

  for (const pluginEntity of pluginEntities) {
    if (allEntities.find((e) => e.name === pluginEntity.name)) {
      throw new InternalServerErrorException();
    } else {
      allEntities.push(pluginEntity);
    }
  }
  return allEntities;
}

export async function preBootstrapConfig(
  userConfig?: Partial<MosaicConfig>
): Promise<Readonly<RuntimeConfig>> {
  if (userConfig) {
    await setConfig(userConfig);
  }
  const entities = await getAllEntities(userConfig);
  await setConfig({
    dbConnectionOptions: {
      entities,
      subscribers: [
        ...(Object.values(
          coreSubscribersMap
        ) as Type<EntitySubscriberInterface>[]),
      ],
    },
  });

  let config = getConfig();
  config = await runPluginConfigurations(config);

  const moneyStrategy = config.entityOptions.moneyStrategy;
  setMoneyStrategy(moneyStrategy, entities);

  setExposedHeaders(config);
  return config;
}

async function bootstrap() {
  const config = await preBootstrapConfig(appConfig);

  const appModule = await import('./app/app.module');
  const { port, cors } = config.apiOptions;

  const app = await NestFactory.create<NestExpressApplication>(
    appModule.AppModule,
    { cors }
  );

  app.enableShutdownHooks();

  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
