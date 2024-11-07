import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import {
  Category,
  MutationArgs,
  SearchInput,
  SearchResponse,
} from '@mosaic/common';

import { SearchResolver as BaseSearchResolver } from '../../../api/resolvers/admin/search.resolver';
import { Ctx, RequestContext } from '../../../api';
import { FullTextSearchService } from '../providers';

@Resolver('SearchResponse')
export class ShopFulltextSearchResolver
  implements Pick<BaseSearchResolver, 'search'>
{
  constructor(private fullTextSearchService: FullTextSearchService) {}

  @Query()
  public async search(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationArgs<SearchInput>
  ): Promise<Omit<SearchResponse, 'categories'>> {
    const result = await this.fullTextSearchService.search(
      ctx,
      args.input,
      true
    );
    // ensure the facetValues property resolver has access to the input args
    (result as any).input = args.input;
    return result;
  }

  @ResolveField()
  async categories(
    @Ctx() ctx: RequestContext,
    @Parent() parent: { input: SearchInput }
  ): Promise<Array<{ category: Category; count: number }>> {
    const categories = await this.fullTextSearchService.categories(
      ctx,
      parent.input,
      true
    );

    return categories.filter((i) => !i.category.isPrivate);
  }
}
