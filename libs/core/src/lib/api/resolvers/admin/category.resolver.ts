import { Args, Query, Resolver } from '@nestjs/graphql';

import { PaginatedList } from '@mosaic/common';

import { QueryListArgs } from '../../../types';
import { Category } from '../../../data';
import { RelationPaths, Relations } from '../../decorators';
import { CategoryService } from '../../../service/services';

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
}
