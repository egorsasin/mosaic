import {
  NoActiveOrderError,
  CreateCustomerInput,
  GuestCheckoutError,
} from '@mosaic/common';

import { Order } from '../../data/entity/order/order.entity';
import { Customer } from '../../data/entity/customer/customer.entity';
import { RequestContext } from '../../api/common';
import { InjectableStrategy } from '../../common';

export type SetCustomerForOrderResult =
  | NoActiveOrderError

  // | AlreadyLoggedInError
  // | EmailAddressConflictError
  | GuestCheckoutError
  | Order;

export interface GuestCheckoutStrategy extends InjectableStrategy {
  setCustomerForOrder(
    ctx: RequestContext,
    order: Order,
    input: CreateCustomerInput
  ):
    | SetCustomerForOrderResult
    | Customer
    | Promise<SetCustomerForOrderResult | Customer>;
}
