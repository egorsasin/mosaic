import { Injector, RequestContext } from '@mosaic/core/api/common';
import { Order } from '@mosaic/core/data';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

export interface PaynowPluginOptions {
  paymentIntentCreateParams?: (
    injector: Injector,
    ctx: RequestContext,
    order: Order
  ) => unknown | Promise<unknown>;
}

export interface PaynowPaymentIntent {
  url: string;
}
