import { MiddlewareConsumer, Module, NestModule, Type } from '@nestjs/common';

import { DataModule } from './data/data.module';
import { ApiModule } from './api/api.module';
import { ServiceModule } from './service/service.module';
import { ConfigModule } from './config/config.module';
import { I18nService } from './i18n';
import { I18nModule } from './i18n/i18n.module';

@Module({
  imports: [ConfigModule, DataModule, ApiModule, ServiceModule, I18nModule],
})
export class MosCoreModule implements NestModule {
  constructor(private i18nService: I18nService) {}

  public configure(consumer: MiddlewareConsumer): void {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const i18nextHandler: Function = this.i18nService.handle();

    consumer.apply(i18nextHandler).forRoutes('*');
  }
}
