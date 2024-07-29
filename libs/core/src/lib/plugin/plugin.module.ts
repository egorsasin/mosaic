import { DynamicModule, Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { getConfig } from '../config/config-helpers';

@Module({
  imports: [ConfigModule],
})
export class PluginModule {
  static forRoot(): DynamicModule {
    return {
      module: PluginModule,
      imports: [...getConfig().plugins],
    };
  }
}
