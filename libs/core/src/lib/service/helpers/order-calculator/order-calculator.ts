import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Order, DATA_SOURCE_PROVIDER } from '../../../data';
import { RequestContext } from '../../../api/common';
import { EventBus } from '../../../event-bus';
import { ShippingMethodService } from '../../services/shipping-method.service';

/**
 * Этот класс используется для внесения изменений в заказ, пересчета цен и стоимости доставки
 */
@Injectable()
export class OrderCalculator {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private shippingMethodService: ShippingMethodService,
    private eventBus: EventBus
  ) {}

  public async applyPriceAdjustments(
    ctx: RequestContext,
    order: Order,
    options?: { recalculateShipping?: boolean }
  ): Promise<Order> {
    //if (options?.recalculateShipping !== false) {
    // TODO Пересчитать доставку
    await this.applyShipping(ctx, order);
    //await this.applyShippingPromotions(ctx, order, promotions);
    //}

    this.calculateOrderTotals(order);

    return order;
  }

  public calculateOrderTotals(order: Order) {
    let totalPrice = 0;
    for (const line of order.lines) {
      totalPrice += line.proratedLinePrice;
    }
    // TODO order.subTotal = totalPrice;

    const shippingPrice = order.shippingLine?.discountedPrice || 0;

    order.shipping = shippingPrice;
  }

  private async applyShipping(ctx: RequestContext, order: Order) {
    const shippingLine = order.shippingLine;

    const currentShippingMethod =
      shippingLine?.shippingMethod &&
      (await this.shippingMethodService.findOne(
        shippingLine.shippingMethod.id
      ));

    if (!currentShippingMethod) {
      return;
    }

    const currentMethodStillEligible = await currentShippingMethod.test(
      ctx,
      order
    );

    if (currentMethodStillEligible) {
      const result = await currentShippingMethod.apply(ctx, order);
      shippingLine.price = result.price || 0;
    } else {
      order.shippingLine = null;
    }
  }
}
