import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { DataModule } from '../data/data.module';
import { EventBusModule } from '../event-bus';

import { OrderModifier } from './helpers/order-modifier/order-modifier';
import { ActiveOrderService } from './helpers/active-order/active-order.service';
import { OrderStateMachine } from './helpers/order-state-machine/order-state-machine';
import { ConfigOptionsService } from './helpers/config-options/config-options.service';
import { PaymentStateMachine } from './helpers/payment-state-machine/payment-state-machine';
import { ConfigArgService } from './helpers/config-args';
import { OrderCalculator } from './helpers/order-calculator';
import { ShippingCalculator } from './helpers/shipping-calculator';
import { EntityHydrator } from './helpers/entity-hydrator';
import { ListQueryBuilder } from './helpers/list-query-builder/list-query-builder';
import { RequestContextService } from './helpers/request-context/request-context.service';

import { UserService } from './services/user.service';
import { CustomerService } from './services/customer.service';
import { AuthService } from './services/auth.service';
import { ExternalAuthenticationService } from './services/external-authentication.service';
import { ProductService } from './services/product.service';
import { SessionService } from './services/session.service';
import { PaymentMethodService } from './services/payment-method.service';
import { ShippingMethodService } from './services/shipping-method.service';
import { OrderService } from './services/order.service';
import { PaymentService } from './services/payment.service';
import { AssetService } from './services/asset.service';
import { CategoryService } from './services/category.service';
import { HistoryService } from './services/history.service';

const helpers = [
  ConfigOptionsService,
  ActiveOrderService,
  PaymentStateMachine,
  OrderStateMachine,
  OrderModifier,
  OrderCalculator,
  ExternalAuthenticationService,
  ConfigArgService,
  ShippingCalculator,
  EntityHydrator,
  ListQueryBuilder,
];

const services = [
  AssetService,
  AuthService,
  CategoryService,
  CustomerService,
  OrderService,
  UserService,
  PaymentService,
  PaymentMethodService,
  ShippingMethodService,
  ProductService,
  SessionService,
  HistoryService,
  RequestContextService,
];

@Module({
  imports: [ConfigModule, DataModule, EventBusModule],
  providers: [...services, ...helpers],
  exports: [...services, ...helpers],
})
export class ServiceCoreModule {}

@Module({
  imports: [ServiceCoreModule],
  exports: [ServiceCoreModule],
})
export class ServiceModule {}
