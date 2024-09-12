import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  ConfigurableOperationDefinition,
  PaginatedList,
  QueryCategoryArgs,
  UserInputError,
} from '@mosaic/common';

import { QueryListArgs } from '../../../types';
import { Category } from '../../../data';
import { Ctx, RelationPaths, Relations } from '../../decorators';
import { CategoryService } from '../../../service/services/category.service';
import { RequestContext } from '../../common';

export type MutationUpdateCollectionArgs = {
  id: number;
  input: any;
};

@Resolver()
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  /**
   * Список категорий с пагинацией
   */
  @Query()
  public async categories(
    @Args() args: QueryListArgs<Category>,
    @Relations({
      entity: Category,
    })
    relations: RelationPaths<Category>
  ): Promise<PaginatedList<Category>> {
    return this.categoryService.findAll(args.options || undefined, relations);
  }

  @Query()
  async category(
    @Args() args: QueryCategoryArgs,
    @Relations({
      entity: Category,
      omit: [],
    })
    relations: RelationPaths<Category>
  ): Promise<Category | undefined> {
    let category: Category | undefined;
    if (args.id) {
      category = await this.categoryService.findOne(args.id, relations);

      if (args.slug && category && category.slug !== args.slug) {
        throw new UserInputError('error.collection-id-slug-mismatch');
      }
    } else if (args.slug) {
      category = await this.categoryService.findOneBySlug(args.slug, relations);
    } else {
      throw new UserInputError('error.collection-id-or-slug-must-be-provided');
    }
    return category;
  }

  @Query()
  public async categoryFilters(): Promise<ConfigurableOperationDefinition[]> {
    return this.categoryService.getAvailableFilters();
  }

  @Mutation()
  public async updateCategory(
    @Ctx() ctx: RequestContext,
    @Args() { input }: MutationUpdateCollectionArgs
  ): Promise<Category> {
    return this.categoryService.update(ctx, input);
  }
}
