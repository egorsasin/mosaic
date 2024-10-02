import { OrderState } from '../../types';
import { RequestContext } from '../../api/common/request-context';

import { OrderPlacedStrategy } from './order-placed-strategy';

/**
 * @description
 * Стратегия размещения заказа по умолчанию {@link OrderPlacedStrategy}.
 * The order is set as "placed" when it transitions from
 * 'ArrangingPayment' to either 'PaymentAuthorized' or 'PaymentSettled'.
 */
export class DefaultOrderPlacedStrategy implements OrderPlacedStrategy {
  public shouldSetAsPlaced(
    ctx: RequestContext,
    fromState: OrderState,
    toState: OrderState
  ): boolean {
    return ['ArrangingPayment', 'PaymentAuthorized', 'PaymentSettled'].includes(
      toState
    );
  }
}
