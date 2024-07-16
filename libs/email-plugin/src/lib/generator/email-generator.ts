import { InjectableStrategy, MosaicEvent } from '@mosaic/core';

import { EmailDetails, EmailPluginOptions } from '../types';

export interface EmailGenerator<
  T extends string = string,
  E extends MosaicEvent = MosaicEvent
> extends InjectableStrategy {
  onInit?(options: EmailPluginOptions): void | Promise<void>;

  generate(
    from: string,
    subject: string,
    body: string,
    templateVars: { [key: string]: any }
  ): Pick<EmailDetails, 'from' | 'subject' | 'body'>;
}
