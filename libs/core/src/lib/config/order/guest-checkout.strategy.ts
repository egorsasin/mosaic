import { CreateCustomerInput, SetCustomerForOrderResult } from '@mosaic/common';

import { Order } from '../../data/entity/order/order.entity';
import { Customer } from '../../data/entity/customer/customer.entity';
import { RequestContext } from '../../api/common';
import { ErrorResultUnion, InjectableStrategy } from '../../common';

export interface GuestCheckoutStrategy extends InjectableStrategy {
  setCustomerForOrder(
    ctx: RequestContext,
    order: Order,
    input: CreateCustomerInput
  ):
    | ErrorResultUnion<SetCustomerForOrderResult, Customer>
    | Promise<ErrorResultUnion<SetCustomerForOrderResult, Customer>>;
}
