import { OrderState } from '../../types';
import { RequestContext } from '../../api/common';
import { InjectableStrategy } from '../../common';
import { Order } from '../../data';

export interface OrderPlacedStrategy extends InjectableStrategy {
  shouldSetAsPlaced(
    ctx: RequestContext,
    fromState: OrderState,
    toState: OrderState,
    order: Order
  ): boolean | Promise<boolean>;
}
