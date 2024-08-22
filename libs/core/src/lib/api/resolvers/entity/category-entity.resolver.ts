import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { ConfigurableOperation } from '@mosaic/common';

import { Category } from '../../../data';

@Resolver('Category')
export class CategoryEntityResolver {
  @ResolveField()
  public filters(@Parent() collection: Category): ConfigurableOperation[] {
    try {
      return collection.filters;
    } catch (e) {
      return [];
    }
  }
}
