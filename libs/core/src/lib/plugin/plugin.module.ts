import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, getConfig } from '../config';

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
