import { Exact, Maybe } from './common';
import {
  AlreadyLoggedInError,
  EmailAddressConflictError,
  GuestCheckoutError,
  NoActiveOrderError,
} from './errors';
import { Customer } from './customer';
import { Product } from './product';
import { ShippingMethod } from './shipping-method';

export interface OrderLine {
  id: number;
  quantity: number;
  product: Product;
  proratedLinePrice: number;
}

export type Node = {
  id: number;
  __typename?: string;
};

export type Payment = Node & {
  __typename?: 'Payment';
  amount: number;
  createdAt: Date;
  method: string;
  updatedAt: Date;
};

export interface Order {
  __typename: 'Order';
  id: number;
  code: string;
  lines: OrderLine[];
  shippingLine?: ShippingLine;
  customer?: Customer;
  shippingAddress?: any;
  payments: Maybe<Payment[]>;
  subTotal: number;
  totalQuantity: number;
  total: number;
  shipping: number;
  status: string;
}

export interface ShippingLine {
  shippingMethod: ShippingMethod;
}

/** Passed as input to the `addPaymentToOrder` mutation. */
export type PaymentInput = {
  /**
   * This field should contain arbitrary data passed to the specified PaymentMethodHandler's `createPayment()` method
   * as the "metadata" argument. For example, it could contain an ID for the payment and other
   * data generated by the payment provider.
   */
  metadata: Record<string, unknown>;
  /** This field should correspond to the `code` property of a PaymentMethod. */
  method: string;
};

export type ShippingInput = {
  metadata: Record<string, unknown>;
  shippingMethodId: number;
};

export type AddressInput = {
  company?: string;
  vatNumber?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  postalCode: string;
  streetLine: string;
};

export type SetCustomerForOrderResult =
  | NoActiveOrderError
  | AlreadyLoggedInError
  | EmailAddressConflictError
  | GuestCheckoutError
  | Order;

export type GetOrderByCodeQuery = {
  orderByCode: Order;
};

export type QueryOrderByCodeArgs = Exact<{
  code: string;
}>;
