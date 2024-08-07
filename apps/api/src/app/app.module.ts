import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { PluginModule } from '@mosaic/core/plugin';
import { MosCoreModule } from '@mosaic/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MosCoreModule, PluginModule.forRoot(), NestConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
