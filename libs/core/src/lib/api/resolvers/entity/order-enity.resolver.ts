import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { assertFound } from '@mosaic/common';

import { Ctx } from '../../decorators';
import { RequestContext } from '../../common';
import { Order } from '../../../data';
import { ShippingLine } from '../../../data/entity/shipping-line';
import { OrderService } from '../../../service/services/order.service';

@Resolver('Order')
export class OrderEntityResolver {
  constructor(private orderService: OrderService) {}

  @ResolveField()
  public async shippingLine(
    @Ctx() ctx: RequestContext,
    @Parent() order: Order
  ): Promise<ShippingLine> {
    if (order.shippingLine) {
      return order.shippingLine;
    }
    const { shippingLine } = await assertFound(
      this.orderService.findOne(order.id, ['shippingLine.shippingMethod'])
    );
    return shippingLine;
  }
}
