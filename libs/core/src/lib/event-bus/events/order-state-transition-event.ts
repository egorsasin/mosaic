import { Order } from '../../data';
import { RequestContext } from '../../api';
import { OrderState } from '../../types';
import { MosaicEvent } from '../event';

export class OrderStateTransitionEvent extends MosaicEvent {
  constructor(
    public fromState: OrderState,
    public toState: OrderState,
    public ctx: RequestContext,
    public order: Order
  ) {
    super();
  }
}
