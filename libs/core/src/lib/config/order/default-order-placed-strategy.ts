import { OrderState } from '../../types';
import { RequestContext } from '../../api/common/request-context';

import { OrderPlacedStrategy } from './order-placed-strategy';

/**
 * @description
 * The default {@link OrderPlacedStrategy}. The order is set as "placed" when it transitions from
 * 'ArrangingPayment' to either 'PaymentAuthorized' or 'PaymentSettled'.
 */
export class DefaultOrderPlacedStrategy implements OrderPlacedStrategy {
  shouldSetAsPlaced(
    ctx: RequestContext,
    fromState: OrderState,
    toState: OrderState
  ): boolean {
    return ['PaymentAuthorized', 'PaymentSettled'].includes(toState);
  }
}
