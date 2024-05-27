import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { DataModule } from '../data/data.module';
import { EventBusModule } from '../event-bus';
import { ServiceModule } from '../service/service.module';

const MODULES = [ConfigModule, EventBusModule, DataModule, ServiceModule];

@Module({
  imports: [...MODULES],
  exports: [...MODULES],
})
export class PluginCommonModule {}
