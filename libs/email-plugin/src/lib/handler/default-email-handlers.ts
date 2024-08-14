import { Request } from 'express';

import {
  Injector,
  Order,
  OrderPlacedEvent,
  RequestContext,
  ShippingLine,
} from '@mosaic/core';
import { ConfigService } from '@mosaic/core/config';
import { EntityHydrator } from '@mosaic/core/service/helpers';
import { PaymentMethodService } from '@mosaic/core/service/services';

import { EmailEventListener } from '../event-listener';
import { EmailEventHandler } from './event-handler';
import { EventWithAsyncData, EventWithContext } from '../types';

export function transformOrderLineAssetUrls(
  ctx: RequestContext,
  order: Order,
  injector: Injector
): Order {
  const { assetStorageStrategy } = injector.get(ConfigService).assetOptions;
  if (assetStorageStrategy.toAbsoluteUrl) {
    const toAbsoluteUrl =
      assetStorageStrategy.toAbsoluteUrl.bind(assetStorageStrategy);

    for (const line of order.lines) {
      const featuredAsset = line.product?.featuredAsset;

      if (featuredAsset) {
        line.product.featuredAsset.preview = toAbsoluteUrl(
          ctx.req as Request,
          featuredAsset.preview
        );
      }
    }
  }

  return order;
}

export const orderConfirmationHandler = new EmailEventListener(
  'order-confirmation'
)
  .on<EventWithContext<OrderPlacedEvent>>(OrderPlacedEvent)
  .filter((event: EventWithContext<OrderPlacedEvent>) => !!event.order.customer)
  .loadData(async ({ event, injector }) => {
    transformOrderLineAssetUrls(event.ctx, event.order, injector);
    await transformPayments(event.ctx, event.order, injector);

    const shippingLine = await hydrateShippingLines(
      event.ctx,
      event.order,
      injector
    );

    return { shippingLine };
  })
  .setRecipient(
    (event: EventWithContext<OrderPlacedEvent>) =>
      event.order.customer?.emailAddress || ''
  )
  .setTemplateVars((event: EventWithAsyncData<any, any>) => ({
    order: event.order,
    shippingLine: event.data.shippingLine,
    url: event.data.url,
  }));

export const defaultEmailHandlers: EmailEventHandler<
  string,
  EventWithContext
>[] = [
  orderConfirmationHandler as unknown as EmailEventHandler<
    string,
    EventWithContext
  >,
];

export async function hydrateShippingLines(
  ctx: RequestContext,
  order: Order,
  injector: Injector
): Promise<ShippingLine | null> {
  const entityHydrator = injector.get(EntityHydrator);

  const line = order.shippingLine;

  await entityHydrator.hydrate(ctx, line, {
    relations: ['shippingMethod'],
  });

  return line.shippingMethod ? line : null;
}

export async function transformPayments(
  ctx: RequestContext,
  order: Order,
  injector: Injector
): Promise<Order> {
  const paymentMethodService = injector.get(PaymentMethodService);

  for (const payment of order.payments || []) {
    const method = await paymentMethodService.findOneByCode(payment.method);

    payment.method = method?.name || '';
  }

  return order;
}
