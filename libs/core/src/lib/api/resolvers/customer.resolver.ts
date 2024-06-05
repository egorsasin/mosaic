import { Query, Resolver } from '@nestjs/graphql';

import { Permission, RequestContext } from '../common';
import { Allow, Ctx } from '../decorators';
import { Customer } from '../../data';
import { CustomerService } from '../../service/services/customer.service';

@Resolver()
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Query()
  @Allow(Permission.Owner)
  public async activeCustomer(
    @Ctx() ctx: RequestContext
  ): Promise<Customer | undefined> {
    const userId = ctx.activeUserId;
    if (userId) {
      return this.customerService.findOneByUserId(userId);
    }
  }
}
