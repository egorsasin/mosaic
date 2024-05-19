import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { ForbiddenError, InternalServerError } from '../../common';
import { Permission, RequestContext } from '../common';
import { Allow, Ctx } from '../decorators';
import { Address, Customer } from '../../data';
import { CustomerService } from '../../service/services';

import { MutationCreateCustomerAddressArgs } from '../../types';

@Resolver()
export class AddressResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Mutation()
  @Allow(Permission.Owner)
  async createCustomerAddress(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationCreateCustomerAddressArgs
  ): Promise<Address> {
    const customer = await this.getCustomerForOwner(ctx);
    return this.customerService.createAddress(customer.id, args.input);
  }

  private async getCustomerForOwner(ctx: RequestContext): Promise<Customer> {
    const userId = ctx.activeUserId;
    if (!userId) {
      throw new ForbiddenError();
    }
    const customer = await this.customerService.findOneByUserId(userId);
    if (!customer) {
      throw new InternalServerError('error.no-customer-found-for-current-user');
    }
    return customer;
  }
}
