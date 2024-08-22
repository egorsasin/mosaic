import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@mosaic/common';

import { MosaicEntityEvent } from '../entity-event';
import { RequestContext } from '../../api';

type CategoryInputTypes = CreateCategoryInput | UpdateCategoryInput | number;

export class CategoryEvent extends MosaicEntityEvent<
  Category,
  CategoryInputTypes
> {
  constructor(
    ctx: RequestContext,
    entity: Category,
    type: 'created' | 'updated' | 'deleted',
    input?: CategoryInputTypes
  ) {
    super(entity, type, ctx, input);
  }
}
