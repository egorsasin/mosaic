import { Args, Query, Resolver } from '@nestjs/graphql';

import {
  InternalServerError,
  MutationArgs,
  SearchInput,
  SearchResponse,
} from '@mosaic/common';

import { Permission, RequestContext } from '../../common';
import { Allow, Ctx } from '../../decorators';

@Resolver()
export class SearchResolver {
  @Query()
  @Allow(Permission.Authenticated)
  async search(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationArgs<SearchInput>
  ): Promise<Omit<SearchResponse, 'categories'>> {
    throw new InternalServerError('error.no-search-plugin-configured');
  }
}
