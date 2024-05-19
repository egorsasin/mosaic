import { Module } from '@nestjs/common';

import { ConfigModule } from '@mosaic/core/config';
import { ApiModule } from '@mosaic/core/api/api.module';
import { DataModule } from '@mosaic/core/data/data.module';
import { ServiceModule } from '@mosaic/core';
import { PluginModule } from '@mosaic/core/plugin';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    DataModule,
    ApiModule,
    ServiceModule,
    PluginModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
