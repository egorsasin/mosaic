import { Args, Query, Resolver } from '@nestjs/graphql';

import { PaginatedList, QueryListArgs } from '../../../types';
import { Product } from '../../../data';
import { ProductService } from '../../../service/services';

@Resolver({})
export class ProductResolver {
  constructor(private productService: ProductService) {}

  @Query()
  public async products(
    @Args() { options }: QueryListArgs
  ): Promise<PaginatedList<Product>> {
    return this.productService.findAll(options);
  }
}
