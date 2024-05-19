import { Args, Query, Resolver } from '@nestjs/graphql';

import { Allow, Ctx } from '../../decorators';
import { Permission, RequestContext } from '../../common';
import { ACTIVE_ORDER_INPUT_FIELD_NAME } from '../../config';
import { OrderService } from '../../../service/services/order.service';
import { ActiveOrderService } from '../../../service/helpers/active-order';

type ActiveOrderArgs = { [ACTIVE_ORDER_INPUT_FIELD_NAME]?: unknown };

export type PaymentMethodQuote = {
  code: string;
  customFields?: string;
  description: string;
  eligibilityMessage?: string;
  id: number;
  isEligible: boolean;
  name: string;
};

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
