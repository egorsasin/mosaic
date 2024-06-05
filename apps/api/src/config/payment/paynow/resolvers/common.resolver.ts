import { Allow, Ctx } from '@mosaic/core/api';
import { Permission, RequestContext } from '@mosaic/core/api/common';
import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql';

import { ActiveOrderService } from '@mosaic/core/service/helpers/active-order';
import { NoActiveOrderError, MutationArgs } from '@mosaic/common';

import { GraphQLValue, isGraphQLError } from '@mosaic/core/common';

import { PaynowPaymentIntent } from '../types';
import { PaynowService } from '../paynow.service';

export type PaynowPaymentIntentInput = {
  orderId: number;
};

@Resolver()
export class PaynowCommonResolver {
  constructor(
    private paynowService: PaynowService,
    private activeOrderService: ActiveOrderService
  ) {}

  @Mutation()
  @Allow(Permission.Owner)
  public async createPaynowIntent(
    @Ctx() ctx: RequestContext,
    @Args() { input }: MutationArgs<PaynowPaymentIntentInput>
  ): Promise<PaynowPaymentIntent | NoActiveOrderError> {
    if (ctx.authorizedAsOwnerOnly) {
      const { orderId } = input;
      const sessionOrder = await this.activeOrderService.getActiveOrder(ctx);

      if (sessionOrder && sessionOrder.id == orderId) {
        return this.paynowService.createPaymentIntent(sessionOrder);
      }
    }

    return new NoActiveOrderError();
  }

  @ResolveField()
  @Resolver('PaynowPaymentIntentResult')
  __resolveType(value: GraphQLValue) {
    return isGraphQLError(value) ? value.__typename : 'PaynowPaymentIntent';
  }
}
