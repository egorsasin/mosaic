import {
  AlreadyLoggedInError,
  CreateCustomerInput,
  GuestCheckoutError,
  SetCustomerForOrderResult,
} from '@mosaic/common';

import { CustomerService } from '../../service/services/customer.service';
import { Injector, RequestContext } from '../../api/common';
import { Customer, Order } from '../../data';
import { ErrorResultUnion } from '../../common';

import { GuestCheckoutStrategy } from './guest-checkout.strategy';

export interface DefaultGuestCheckoutStrategyOptions {
  allowGuestCheckouts?: boolean;
  allowGuestCheckoutForRegisteredCustomers?: boolean;
}

export class DefaultGuestCheckoutStrategy implements GuestCheckoutStrategy {
  private customerService: CustomerService;
  private readonly options: Required<DefaultGuestCheckoutStrategyOptions> = {
    allowGuestCheckouts: true,
    allowGuestCheckoutForRegisteredCustomers: false,
  };
  init(injector: Injector) {
    this.customerService = injector.get(CustomerService);
  }

  constructor(options?: DefaultGuestCheckoutStrategyOptions) {
    this.options = {
      ...this.options,
      ...(options ?? {}),
    };
  }
  async setCustomerForOrder(
    ctx: RequestContext,
    order: Order,
    input: CreateCustomerInput
  ): Promise<ErrorResultUnion<SetCustomerForOrderResult, Customer>> {
    if (!this.options.allowGuestCheckouts) {
      return new GuestCheckoutError();
    }

    if (ctx.activeUserId) {
      return new AlreadyLoggedInError();
    }
    const errorOnExistingUser =
      !this.options.allowGuestCheckoutForRegisteredCustomers;
    const customer = await this.customerService.createOrUpdate(
      ctx,
      input,
      errorOnExistingUser
    );

    return customer;
  }
}
