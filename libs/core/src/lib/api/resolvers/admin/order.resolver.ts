import { Args, Query, Resolver } from '@nestjs/graphql';

import { PaginatedList } from '@mosaic/common';

import { QueryListArgs } from '../../../types';
import { Order } from '../../../data';
import { OrderService } from '../../../service/services/order.service';
import { Allow } from '../../decorators';
import { Permission } from '../../common';

@Resolver()
export class OrderResolver {
  constructor(private orderService: OrderService) {}

  /**
   * Список заказов с пагинацией
   */
  @Query()
  @Allow(Permission.Authenticated)
  public async orders(
    @Args() { options }: QueryListArgs
  ): Promise<PaginatedList<Order>> {
    return this.orderService.findAll(options);
  }
}
