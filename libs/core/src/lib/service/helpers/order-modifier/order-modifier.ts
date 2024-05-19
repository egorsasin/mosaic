import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityNotFoundError } from 'typeorm';

import { Order, OrderLine, Product } from '../../../data';
import { DATA_SOURCE_PROVIDER } from '../../../data/data.module';

@Injectable()
export class OrderModifier {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
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
}
