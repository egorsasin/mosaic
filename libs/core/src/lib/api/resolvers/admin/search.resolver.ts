import { Query, Resolver } from '@nestjs/graphql';

import { InternalServerError, SearchResponse } from '@mosaic/common';

@Resolver()
export class SearchResolver {
  @Query()
  async search(): Promise<Omit<SearchResponse, 'collections'>> {
    throw new InternalServerError('error.no-search-plugin-configured');
  }
}
