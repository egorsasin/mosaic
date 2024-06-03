import { Query, Resolver } from '@nestjs/graphql';

import { ShippingMethodQuote } from '@mosaic/common';

import { Allow, Ctx } from '../../decorators';
import { Permission, RequestContext } from '../../common';
import { OrderService } from '../../../service/services/order.service';
import { ActiveOrderService } from '../../../service/helpers/active-order';

@Resolver()
export class ShippingMethodResolver {
  constructor(
    private orderService: OrderService,
    private activeOrderService: ActiveOrderService
  ) {}

  @Query()
  @Allow(Permission.Owner)
  public async eligibleShippingMethods(
    @Ctx() ctx: RequestContext
  ): Promise<ShippingMethodQuote[]> {
    if (ctx.authorizedAsOwnerOnly) {
      const sessionOrder = await this.activeOrderService.getActiveOrder(ctx);
      if (sessionOrder) {
        const methods = await this.orderService.getEligibleShippingMethods(
          ctx,
          sessionOrder.id
        );
        return methods;
      }
    }
    return [];
  }
}
