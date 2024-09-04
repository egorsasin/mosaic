import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityNotFoundError } from 'typeorm';

import { IneligibleShippingMethodError } from '@mosaic/common';

import { Order, OrderLine, Product, DATA_SOURCE_PROVIDER } from '../../../data';
import { RequestContext } from '../../../api/common';
import { EventBus, OrderLineEvent } from '../../../event-bus';
import { ShippingCalculator } from '../shipping-calculator';
import { ShippingLine } from '../../../data/entity/shipping-line';

@Injectable()
export class OrderModifier {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private shippingCalculator: ShippingCalculator,
    private eventBus: EventBus
  ) {}

  public async getOrCreateOrderLine(
    ctx: RequestContext,
    order: Order,
    productId: number
  ): Promise<OrderLine> {
    const existingOrderLine = order.lines.find(
      (line: OrderLine) => line.product.id === productId
    );

    if (existingOrderLine) {
      return existingOrderLine;
    }

    const product = await this.dataSource.getRepository(Product).findOne({
      where: {
        id: productId,
        enabled: true,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new EntityNotFoundError(Product, { id: productId });
    }

    const orderLine: OrderLine = await this.dataSource
      .getRepository(OrderLine)
      .save(
        new OrderLine({
          product,
          listPrice: product.price,
          adjustments: [],
          quantity: 0,
        })
      );

    order.lines.push(orderLine);
    await this.dataSource.getRepository(Order).save(order, { reload: false });

    const lineWithRelations = await this.dataSource
      .getRepository(OrderLine)
      .findOne({
        where: { id: orderLine.id },
        relations: ['product'],
      });

    this.eventBus.publish(
      new OrderLineEvent(ctx, order, lineWithRelations, 'created')
    );

    return lineWithRelations;
  }

  public async setShippingMethod(
    ctx: RequestContext,
    order: Order,
    shippingMethodId: number,
    rawMetadata = {}
  ) {
    const shippingMethod = await this.shippingCalculator.getMethodIfEligible(
      ctx,
      order,
      shippingMethodId
    );

    if (!shippingMethod) {
      return new IneligibleShippingMethodError();
    }

    let shippingLine: ShippingLine | undefined = order.shippingLine;
    const metadata = JSON.stringify(rawMetadata);

    if (shippingLine) {
      shippingLine.shippingMethod = shippingMethod;
      shippingLine.metadata = metadata;
    } else {
      shippingLine = new ShippingLine({
        shippingMethod,
        order,
        adjustments: [],
        price: 0,
        metadata,
      });
      order.shippingLine = shippingLine;
    }

    await this.dataSource.getRepository(ShippingLine).save(shippingLine);

    return order;
  }

  /**
   * @description
   * Updates the quantity of an OrderLine, taking into account the available saleable stock level.
   * Returns the actual quantity that the OrderLine was updated to (which may be less than the
   * `quantity` argument if insufficient stock was available.
   */
  public async updateOrderLineQuantity(
    ctx: RequestContext,
    orderLine: OrderLine,
    quantity: number,
    order: Order
  ): Promise<OrderLine> {
    orderLine.quantity = quantity;

    await this.dataSource.getRepository(OrderLine).save(orderLine);
    await this.eventBus.publish(
      new OrderLineEvent(ctx, order, orderLine, 'updated')
    );

    return orderLine;
  }
}
