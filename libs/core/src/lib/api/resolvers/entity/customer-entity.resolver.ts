import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { CustomerService } from '../../../service/services/customer.service';
import { Ctx } from '../../decorators';
import { RequestContext } from '../../common';
import { Address, Customer } from '../../../data';

@Resolver(() => Customer)
export class CustomerEntityResolver {
  constructor(private customerService: CustomerService) {}

  @ResolveField()
  async addresses(
    @Ctx() ctx: RequestContext,
    @Parent() customer: Customer
  ): Promise<Address[]> {
    if (!ctx.activeUserId) {
      // Guest customers should not be able to see this data
      return [];
    }
    return this.customerService.findAddressesByCustomerId(customer.id);
  }
}
