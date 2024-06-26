import { Query, Resolver } from '@nestjs/graphql';

import { PaymentMethodQuote } from '@mosaic/common';

import { Allow, Ctx } from '../../decorators';
import { Permission, RequestContext } from '../../common';
import { OrderService } from '../../../service/services/order.service';
import { ActiveOrderService } from '../../../service/helpers/active-order';

@Resolver()
export class PaymentMethodResolver {
  constructor(
    private orderService: OrderService,
    private activeOrderService: ActiveOrderService
  ) {}

  @Query()
  @Allow(Permission.Owner)
  public async eligiblePaymentMethods(
    @Ctx() ctx: RequestContext
  ): Promise<PaymentMethodQuote[]> {
    if (ctx.authorizedAsOwnerOnly) {
      const sessionOrder = await this.activeOrderService.getActiveOrder(ctx);
      if (sessionOrder) {
        return this.orderService.getEligiblePaymentMethods(
          ctx,
          sessionOrder.id
        );
      }
    }
    return [];
  }
}
