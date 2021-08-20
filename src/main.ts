import { DynamicModule, Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { graphqlUploadExpress } from 'graphql-upload';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { getConfig, MosaicConfig, RuntimeConfig, setConfig } from './config';
import { appConfig } from './app.config';
import { getConfigurationFunction } from './plugin';
import { NestExpressApplication } from '@nestjs/platform-express';

async function runPluginConfigurations(
  config: RuntimeConfig,
): Promise<RuntimeConfig> {
  const { plugins } = config;
  plugins.forEach(async (plugin: DynamicModule | Type<any>) => {
    const configFn = getConfigurationFunction(plugin);
    if (typeof configFn === 'function') {
      config = await configFn(config);
    }
  });
  return config;
}

export async function preBootstrapConfig(
  userConfig?: Partial<MosaicConfig>,
): Promise<Readonly<RuntimeConfig>> {
  if (userConfig) {
    setConfig(userConfig);
  }
  let config = getConfig();
  config = await runPluginConfigurations(config);

  return config;
}

async function bootstrap(appConfig?: Partial<MosaicConfig>) {
  const config = await preBootstrapConfig(appConfig);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const { port } = config.apiOptions;

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(cookieParser());
  app.use(graphqlUploadExpress());

  app.enableShutdownHooks();

  await app.listen(port);
}

bootstrap(appConfig);
