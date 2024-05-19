import { Allow, Ctx } from '@mosaic/core/api';
import { Permission, RequestContext } from '@mosaic/core/api/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { PaynowService } from '../paynow.service';

@Resolver()
export class PaynowCommonResolver {
  constructor(private paynowService: PaynowService) {}

  @Mutation()
  @Allow(Permission.Owner)
  async createPaynowIntent(
    @Ctx() ctx: RequestContext
    //@Args() { input }: MutationArgs<PaynowPaymentIntentInput>
  ): Promise<string> {
    return this.paynowService.createPaymentIntent();
  }
}
