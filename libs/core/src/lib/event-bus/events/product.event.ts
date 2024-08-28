import { Product } from '../../data';
import { RequestContext } from '../../api/common/request-context';
import { CreateProductInput, UpdateProductInput } from '../../types';
import { MosaicEntityEvent } from '../entity-event';

type ProductInputTypes = CreateProductInput | UpdateProductInput | number;

/**
 * @description
 * Это событие происходит всякий раз когда товар {@link Product}
 * добавлен, изменен или удален
 */
export class ProductEvent extends MosaicEntityEvent<
  Product,
  ProductInputTypes
> {
  constructor(
    ctx: RequestContext,
    entity: Product,
    type: 'created' | 'updated' | 'deleted',
    input?: ProductInputTypes
  ) {
    super(entity, type, ctx, input);
  }
}
