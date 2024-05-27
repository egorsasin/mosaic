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
    order: Order,
    productId: number,
    quantity: number
  ) {
    let orderLine = order.lines.find(
      (line: OrderLine) => line.product.id === productId
    );

    if (orderLine) {
      orderLine.quantity += quantity;
      await this.dataSource.getRepository(OrderLine).save(orderLine);
    } else {
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

      orderLine = new OrderLine({
        product,
        quantity,
      });

      await this.dataSource.getRepository(OrderLine).save(orderLine);
      order.lines.push(orderLine);
      await this.dataSource.getRepository(Order).save(order, { reload: false });
    }
  }

  /**
   * @description
   * Updates the quantity of an OrderLine, taking into account the available saleable stock level.
   * Returns the actual quantity that the OrderLine was updated to (which may be less than the
   * `quantity` argument if insufficient stock was available.
   */
  async updateOrderLineQuantity(
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
