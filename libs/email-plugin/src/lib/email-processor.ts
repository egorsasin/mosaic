import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { Injector, RequestContext } from '@mosaic/core';

import { EmailSender, NodemailerEmailSender } from './sender';
import { EMAIL_PLUGIN_OPTIONS } from './constants';
import {
  EmailDetails,
  EmailTransportOptions,
  InitializedEmailPluginOptions,
  IntermediateEmailDetails,
} from './types';
import { resolveTransportSettings } from './common';
import { EmailGenerator, HandlebarsMjmlGenerator } from './generator';

@Injectable()
export class EmailProcessor {
  protected emailSender!: EmailSender;
  protected generator: EmailGenerator = new HandlebarsMjmlGenerator();

  constructor(
    @Inject(EMAIL_PLUGIN_OPTIONS)
    private options: InitializedEmailPluginOptions,
    private moduleRef: ModuleRef
  ) {}

  public async init(): Promise<void> {
    this.emailSender = this.options.emailSender
      ? this.options.emailSender
      : new NodemailerEmailSender();

    if (this.generator.onInit) {
      await this.generator.onInit.call(this.generator, this.options);
    }
  }

  public async process(data: IntermediateEmailDetails): Promise<void> {
    const ctx = {} as RequestContext;
    let emailDetails: EmailDetails;

    try {
      const bodySource = await this.options.templateLoader.loadTemplate(
        new Injector(this.moduleRef),
        ctx,
        {
          templateName: data.templateFile,
          type: data.type,
          templateVars: data.templateVars,
        }
      );

      const generated = this.generator.generate(
        data.from,
        data.subject,
        bodySource,
        data.templateVars
      );

      emailDetails = {
        ...generated,
        recipient: data.recipient,
        attachments: [], //deserializeAttachments(data.attachments),
        cc: data.cc,
        bcc: data.bcc,
        replyTo: data.replyTo,
      };
      const transportSettings = await this.getTransportSettings(ctx);

      await this.emailSender.send(emailDetails, transportSettings);
      //   await this.eventBus.publish(new EmailSendEvent(ctx, emailDetails, true));
    } catch (err: unknown) {
      //   if (err instanceof Error) {
      //     Logger.error(err.message, loggerCtx, err.stack);
      //   } else {
      //     Logger.error(String(err), loggerCtx);
      //   }
      //   await this.eventBus.publish(
      //     new EmailSendEvent(ctx, emailDetails, false, err as Error)
      //   );
      //   throw err;
    }
  }

  public async getTransportSettings(
    ctx?: RequestContext
  ): Promise<EmailTransportOptions> {
    return await resolveTransportSettings(
      this.options,
      new Injector(this.moduleRef),
      ctx
    );
  }
}
