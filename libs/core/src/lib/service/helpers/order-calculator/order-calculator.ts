import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Order, DATA_SOURCE_PROVIDER } from '../../../data';
import { RequestContext } from '../../../api/common';
import { EventBus } from '../../../event-bus';

/**
 * Этот класс используется для внесения изменений в заказ, пересчета цен и стоимости доставки
 */
@Injectable()
export class OrderCalculator {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private eventBus: EventBus
  ) {}

  public async applyPriceAdjustments(
    ctx: RequestContext,
    order: Order,
    options?: { recalculateShipping?: boolean }
  ): Promise<Order> {
    if (options?.recalculateShipping !== false) {
      // TODO Пересчитать доставку
      //await this.applyShipping(ctx, order);
      //await this.applyShippingPromotions(ctx, order, promotions);
    }

    this.calculateOrderTotals(order);

    return order;
  }

  public calculateOrderTotals(order: Order) {
    let totalPrice = 0;
    for (const line of order.lines) {
      totalPrice += line.proratedLinePrice;
    }
    order.subTotal = totalPrice;

    const shippingPrice = order.shippingLine?.discountedPrice || 0;

    order.shipping = shippingPrice;
  }
}
