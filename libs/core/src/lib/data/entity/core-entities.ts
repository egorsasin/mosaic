import { Address } from './address';
import { Asset } from './asset';
import {
  AuthenticationMethod,
  ExternalAuthenticationMethod,
  NativeAuthenticationMethod,
} from './authentication';
import { Category } from './category';
import { Customer } from './customer/customer.entity';
import { HistoryEntry, OrderHistoryEntry } from './history';
import { Order, OrderLine } from './order';
import { Payment } from './payment';
import { PaymentMethod } from './payment-method';
import { Product, ProductAsset } from './product';
import { AnonymousSession, AuthenticatedSession, Session } from './session';
import { ShippingLine } from './shipping-line';
import { ShippingMethod } from './shipping-method';
import { User } from './user';

export const coreEntitiesMap = {
  Asset,
  Address,
  AuthenticationMethod,
  Customer,
  NativeAuthenticationMethod,
  ExternalAuthenticationMethod,
  User,
  Order,
  OrderLine,
  Payment,
  PaymentMethod,
  ShippingMethod,
  Product,
  ProductAsset,
  Session,
  AnonymousSession,
  HistoryEntry,
  OrderHistoryEntry,
  AuthenticatedSession,
  ShippingLine,
  Category,
};
