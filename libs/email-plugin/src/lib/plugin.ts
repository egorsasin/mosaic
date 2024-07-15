import { Inject, OnApplicationBootstrap, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  MosaicPlugin,
  PluginCommonModule,
  Injector,
  EventBus,
  MosaicEvent,
} from '@mosaic/core';

import {
  EmailPluginOptions,
  EventWithContext,
  InitializedEmailPluginOptions,
} from './types';
import { EMAIL_PLUGIN_OPTIONS } from './constants';
import { EmailEventHandler, EmailEventHandlerWithAsyncData } from './handler';

@MosaicPlugin({
  imports: [PluginCommonModule],
  providers: [
    { provide: EMAIL_PLUGIN_OPTIONS, useFactory: () => EmailPlugin.options },
  ],
})
export class EmailPlugin implements OnApplicationBootstrap {
  private static options: InitializedEmailPluginOptions;

  static init(options: EmailPluginOptions): Type<EmailPlugin> {
    this.options = options as InitializedEmailPluginOptions;

    return EmailPlugin;
  }

  constructor(
    @Inject(EMAIL_PLUGIN_OPTIONS)
    private options: InitializedEmailPluginOptions,
    private moduleRef: ModuleRef,
    private eventBus: EventBus
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.initInjectableStrategies();
    await this.setupEventSubscribers();
  }

  private async setupEventSubscribers() {
    for (const handler of EmailPlugin.options.handlers) {
      this.eventBus.ofType(handler.event).subscribe((event) => {
        return this.handleEvent(handler, event);
      });
    }
  }

  private async initInjectableStrategies() {
    const injector = new Injector(this.moduleRef);
  }

  private async handleEvent(
    handler: EmailEventHandler | EmailEventHandlerWithAsyncData<unknown>,
    event: MosaicEvent
  ): Promise<void> {
    try {
      const injector = new Injector(this.moduleRef);
      const result = await handler.handle(
        event as EventWithContext,
        [], //EmailPlugin.options.globalTemplateVars,
        injector
      );
    } catch (e: any) {
      // Do nothing
    }
  }
}
