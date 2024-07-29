import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { ApiModule } from './api/api.module';
import { DataModule } from './data/data.module';
import { ServiceModule } from './service/service.module';
import { PluginModule } from './plugin';

@Module({
  imports: [
    ConfigModule,
    DataModule,
    ApiModule,
    ServiceModule,
    PluginModule.forRoot(),
  ],
  providers: [],
})
export class MosCoreModule {}
