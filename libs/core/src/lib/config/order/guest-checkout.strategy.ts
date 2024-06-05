import { Customer, Order } from '../../data';
import { RequestContext } from '../../api/common';
import { InjectableStrategy, NoActiveOrderError } from '../../common';

export type SetCustomerForOrderResult =
  | AlreadyLoggedInError
  | EmailAddressConflictError
  | GuestCheckoutError
  | NoActiveOrderError
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
