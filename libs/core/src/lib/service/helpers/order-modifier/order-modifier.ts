import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityNotFoundError } from 'typeorm';

import { Order, OrderLine, Product, DATA_SOURCE_PROVIDER } from '../../../data';
import { RequestContext } from '../../../api/common';
import { EventBus, OrderLineEvent } from '../../../event-bus';

@Injectable()
export class OrderModifier {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
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
