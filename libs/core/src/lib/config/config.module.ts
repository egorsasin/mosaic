import {
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { Injector } from '../api/common';
import { InjectableStrategy } from '../common';

import { ConfigService } from './config.service';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    private configService: ConfigService,
    private moduleRef: ModuleRef
  ) {}

  public async onApplicationBootstrap() {
    await this.initInjectableStrategies();
  }

  public async onApplicationShutdown() {
    await this.destroyInjectableStrategies();
  }

  private async initInjectableStrategies() {
    const injector = new Injector(this.moduleRef);

    for (const strategy of this.getInjectableStrategies()) {
      if (typeof strategy.init === 'function') {
        await strategy.init(injector);
      }
    }
  }

  private async destroyInjectableStrategies() {
    for (const strategy of this.getInjectableStrategies()) {
      if (typeof strategy.destroy === 'function') {
        await strategy.destroy();
      }
    }
  }

  private getInjectableStrategies(): InjectableStrategy[] {
    const { process: paymentProcess } = this.configService.paymentOptions;
    const { process: orderProcess } = this.configService.orderOptions;
    const { authenticationStrategy } = this.configService.authOptions;

    return [...authenticationStrategy, ...paymentProcess, ...orderProcess];
  }
}
