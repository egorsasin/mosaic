import { Order } from '../../../data';
import { InjectableStrategy } from '../../../common';
import { RequestContext } from '../../common';

export const ACTIVE_ORDER_INPUT_FIELD_NAME = 'activeOrderInput';

export interface ActiveOrderStrategy<
  InputType extends Record<string, unknown> | void = void
> extends InjectableStrategy {
  readonly name: string;

  createActiveOrder?: (ctx: RequestContext, input: InputType) => Promise<Order>;
}
