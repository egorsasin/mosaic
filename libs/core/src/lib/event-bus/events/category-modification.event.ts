import { RequestContext } from '../../api/common/request-context';
import { MosaicEvent } from '../event';
import { Category } from '../../data';

export class CategoryModificationEvent extends MosaicEvent {
  constructor(
    public ctx: RequestContext,
    public collection: Category,
    public productVariantIds: number[]
  ) {
    super();
  }
}
