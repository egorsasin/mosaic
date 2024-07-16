import { OrderPlacedEvent } from '@mosaic/core';

import { EmailEventListener } from '../event-listener';
import { EmailEventHandler } from './event-handler';
import { EventWithContext } from '../types';

export const orderConfirmationHandler = new EmailEventListener(
  'order-confirmation'
)
  .on<OrderPlacedEvent>(OrderPlacedEvent)
  .filter((event: OrderPlacedEvent) => {
    return true;
  }) //!!event.order.customer)
  .setRecipient(
    (event: OrderPlacedEvent) =>
      event.order.customer?.emailAddress || 'egorsasin@gmail.com'
  );

export const defaultEmailHandlers: EmailEventHandler<
  string,
  EventWithContext
>[] = [
  orderConfirmationHandler as unknown as EmailEventHandler<
    string,
    EventWithContext
  >,
];
