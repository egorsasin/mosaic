import { InjectableStrategy } from '@mosaic/core';

import { EmailDetails, EmailTransportOptions } from '../types';

export interface EmailSender extends InjectableStrategy {
  send: (
    email: EmailDetails,
    options: EmailTransportOptions
  ) => void | Promise<void>;
}
