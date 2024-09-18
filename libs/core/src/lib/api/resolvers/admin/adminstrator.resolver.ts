import { Resolver, Query } from '@nestjs/graphql';

import { Allow, Ctx } from '../../decorators';
import { Permission, RequestContext } from '../../common';
import { Administrator } from '../../../data';
import { AdministratorService } from '../../../service';

@Resolver()
export class AdministratorResolver {
  constructor(private administratorService: AdministratorService) {}

  @Query()
  @Allow(Permission.Owner)
  async activeAdministrator(
    @Ctx() ctx: RequestContext
  ): Promise<Administrator | undefined> {
    if (ctx.activeUserId) {
      return this.administratorService.findOneByUserId(ctx, ctx.activeUserId);
    }
  }
}
