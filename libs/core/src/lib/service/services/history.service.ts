import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { HistoryEntryType } from '@mosaic/common';

import { OrderState, PaymentState } from '../../types';
import { RequestContext } from '../../api/common';
import { DATA_SOURCE_PROVIDER, Order, OrderHistoryEntry } from '../../data';
import { EventBus, HistoryEntryEvent } from '../../event-bus';

export interface OrderHistoryEntryData {
  [HistoryEntryType.ORDER_STATE_TRANSITION]: {
    from: OrderState;
    to: OrderState;
  };
  [HistoryEntryType.ORDER_PAYMENT_TRANSITION]: {
    paymentId: number;
    from: PaymentState;
    to: PaymentState;
  };
  [HistoryEntryType.ORDER_NOTE]: {
    note: string;
  };
  [HistoryEntryType.ORDER_COUPON_REMOVED]: {
    couponCode: string;
  };
}

export interface CreateOrderHistoryEntryArgs<
  T extends keyof OrderHistoryEntryData
> {
  orderId: number;
  ctx: RequestContext;
  type: T;
  data: OrderHistoryEntryData[T];
}

@Injectable()
export class HistoryService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private eventBus: EventBus
  ) {}

  public async createHistoryEntryForOrder<
    T extends keyof OrderHistoryEntryData
  >(
    args: CreateOrderHistoryEntryArgs<T>,
    isPublic = true
  ): Promise<OrderHistoryEntry> {
    const { ctx, data, orderId, type } = args;
    //const administrator = await this.getAdministratorFromContext(ctx);
    const entry = new OrderHistoryEntry({
      type,
      isPublic,
      data,
      order: { id: orderId } as Order,
      //administrator,
    });
    const history = await this.dataSource
      .getRepository(OrderHistoryEntry)
      .save(entry);

    this.eventBus.publish(
      new HistoryEntryEvent(ctx, history, 'created', 'order', { type, data })
    );

    return history;
  }
}
