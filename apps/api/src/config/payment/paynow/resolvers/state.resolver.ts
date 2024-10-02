import { Allow, Ctx } from '@mosaic/core/api';
import { Permission, RequestContext } from '@mosaic/core/api/common';
import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql';

import { NoActiveOrderError, MutationArgs, Success } from '@mosaic/common';
import { GraphQLValue, isGraphQLError } from '@mosaic/core/common';

import { PaynowService } from '../paynow.service';

export type PaynowPaymentIntentInput = {
  orderId: number;
};

export type PaynowStatusInput = {
  transactionId: string;
};

@Resolver()
export class PaynowStateResolver {
  constructor(private paynowService: PaynowService) {}

  @Mutation()
  @Allow(Permission.Public)
  public async updatePynowPaymentStatus(
    @Ctx() ctx: RequestContext,
    @Args() { input }: MutationArgs<PaynowStatusInput>
  ): Promise<Success | NoActiveOrderError> {
    const { transactionId } = input;

    return this.paynowService.syncPaymentState(ctx, transactionId);
  }

  @ResolveField()
  @Resolver('PaynowPaymentStateResult')
  __resolveType(value: GraphQLValue) {
    return isGraphQLError(value) ? value.__typename : 'PaynowPaymentResponse';
  }
}
