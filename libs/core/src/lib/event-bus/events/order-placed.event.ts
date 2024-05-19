import { Order } from '../../data';
import { RequestContext } from '../../api/common';
import { MosaicEvent } from '../event';
import { OrderState } from '../../types';

export class OrderPlacedEvent extends MosaicEvent {
  constructor(
    public fromState: OrderState,
    public toState: OrderState,
    public ctx: RequestContext,
    public order: Order
  ) {
    super();
  }
}
