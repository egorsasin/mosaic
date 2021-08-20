import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class PluginModule {
  static forRoot(): DynamicModule {
    return {
      module: PluginModule,
      imports: [],
    };
  }
}
