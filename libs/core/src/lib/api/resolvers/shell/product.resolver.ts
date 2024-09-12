import { Args, Query, Resolver } from '@nestjs/graphql';

import {
  UserInputError,
  PaginatedList,
  InternalServerError,
  SearchResponse,
} from '@mosaic/common';

import { QueryListArgs, QueryProductArgs } from '../../../types';
import { Product } from '../../../data';
import { ProductService } from '../../../service';

@Resolver({})
export class ProductResolver {
  constructor(private productService: ProductService) {}

  @Query()
  public async products(
    @Args() { options }: QueryListArgs<Product>
  ): Promise<PaginatedList<Product>> {
    return this.productService.findAll(options);
  }

  @Query()
  public async product(
    @Args() args: QueryProductArgs
  ): Promise<Product | undefined> {
    if (args.id) {
      const product = await this.productService.findOne(args.id);
      if (args.slug && product && product.slug !== args.slug) {
        throw new UserInputError('error.product-id-slug-mismatch');
      }
      return product;
    } else if (args.slug) {
      return this.productService.findOneBySlug(args.slug);
    } else {
      throw new UserInputError('error.product-id-or-slug-must-be-provided');
    }
  }

  @Query()
  public async search(): Promise<SearchResponse> {
    throw new InternalServerError('error.no-search-plugin-configured');
  }
}
