import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { DataModule } from '../data/data.module';
import { EventBusModule } from '../event-bus';

@Module({
  imports: [ConfigModule, EventBusModule, DataModule],
  exports: [ConfigModule, EventBusModule, DataModule],
})
export class PluginCommonModule {}
