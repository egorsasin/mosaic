import express from 'express';
import path from 'path';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { MosaicPlugin, PluginCommonModule } from '@mosaic/core/plugin';

import { GoogleAuthenticationStrategy } from './google-authentication-strategy';
import { GoogleAuthPluginOptions } from './types';

@MosaicPlugin({
  imports: [PluginCommonModule],
  configuration: (config) => {
    // Динамически добавим стратегию в опции аутентификации
    config.authOptions.authenticationStrategy = [
      ...config.authOptions.authenticationStrategy,
      new GoogleAuthenticationStrategy(GoogleAuthPlugin.options.clientId),
    ];
    return config;
  },
})
export class GoogleAuthPlugin implements NestModule {
  static options: GoogleAuthPluginOptions;

  static init(options: GoogleAuthPluginOptions) {
    this.options = options;
    return GoogleAuthPlugin;
  }

  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(express.static(path.join(__dirname, 'public'))).forRoutes('google-login');
  }
}
