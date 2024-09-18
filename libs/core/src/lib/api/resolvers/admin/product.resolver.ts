import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { UserInputError } from '@nestjs/apollo';

import { PaginatedList, MutationArgs } from '@mosaic/common';

import {
  CreateProductInput,
  QueryListArgs,
  QueryProductArgs,
  UpdateProductInput,
} from '../../../types';
import { Product } from '../../../data';
import { ProductService } from '../../../service/services/product.service';
import { Allow } from '../../decorators';
import { Permission } from '../..';

@Resolver()
export class ProductResolver {
  constructor(private productService: ProductService) {}

  /**
   * Список товаров с пагинацией
   */
  @Query()
  @Allow(Permission.Authenticated)
  public async products(
    @Args() { options }: QueryListArgs
  ): Promise<PaginatedList<Product>> {
    return this.productService.findAll(options);
  }

  @Query()
  @Allow(Permission.Authenticated)
  async product(
    @Args() { id, slug }: QueryProductArgs
  ): Promise<Product | undefined> | never {
    if (id) {
      const product = await this.productService.findOne(id);
      if (slug && product && product.slug !== slug) {
        throw new UserInputError('error.product-id-slug-mismatch');
      }
      return product;
    } else if (slug) {
      return this.productService.findOneBySlug(slug);
    }

    throw new UserInputError('error.product-id-or-slug-must-be-provided');
  }

  @Mutation()
  @Allow(Permission.Authenticated)
  async createProduct(
    @Args() args: MutationArgs<CreateProductInput>
  ): Promise<Product> {
    const { input } = args;
    return this.productService.create(input);
  }

  @Mutation()
  @Allow(Permission.Authenticated)
  async updateProduct(
    @Args() { input, id }: MutationArgs<UpdateProductInput> & { id: number }
  ): Promise<Product> {
    return await this.productService.update({ ...input, id });
  }

  @Query()
  @Allow(Permission.Authenticated)
  public async checkProductSlug(
    @Args() { input }: { input: { slug: string; id?: number } }
  ): Promise<{ success: boolean }> {
    const slug = await this.productService.validateSlugs(input);

    return { success: !!slug };
  }
}
