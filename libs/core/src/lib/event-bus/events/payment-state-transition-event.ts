import { Order, Payment } from '../../data';
import { RequestContext } from '../../api';
import { PaymentState } from '../../types';
import { MosaicEvent } from '../event';

export class PaymentStateTransitionEvent extends MosaicEvent {
  constructor(
    public fromState: PaymentState,
    public toState: PaymentState,
    public ctx: RequestContext,
    public payment: Payment,
    public order: Order
  ) {
    super();
  }
}
