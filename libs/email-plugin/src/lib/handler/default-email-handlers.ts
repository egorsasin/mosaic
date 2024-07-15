import { OrderPlacedEvent } from '@mosaic/core';

import { EmailEventListener } from '../event-listener';
import { EventWithContext } from '../types';
import { EmailEventHandler } from './event-handler';

export const orderConfirmationHandler = new EmailEventListener(
  'order-confirmation'
).on(OrderPlacedEvent);

export const defaultEmailHandlers: EmailEventHandler<
  string,
  EventWithContext
>[] = [orderConfirmationHandler];
