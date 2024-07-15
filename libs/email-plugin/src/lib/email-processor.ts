import { Inject, Injectable } from '@nestjs/common';

import { EmailSender, NodemailerEmailSender } from './sender';
import { EMAIL_PLUGIN_OPTIONS } from './constants';
import { InitializedEmailPluginOptions } from './types';

@Injectable()
export class EmailProcessor {
  protected emailSender?: EmailSender;

  constructor(
    @Inject(EMAIL_PLUGIN_OPTIONS) private options: InitializedEmailPluginOptions
  ) {}

  public async init() {
    this.emailSender = this.options.emailSender
      ? this.options.emailSender
      : new NodemailerEmailSender();
  }
}
