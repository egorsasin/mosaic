import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Ctx } from '../../decorators';
import { RequestContext } from '../../common';
import { Administrator } from '../../../data';

@Resolver('Administrator')
export class AdministratorEntityResolver {
  @ResolveField()
  public async emailAddress(
    @Ctx() ctx: RequestContext,
    @Parent() administrator: Administrator
  ): Promise<string> {
    return administrator?.user?.identifier || '';
  }
}
