import { Module } from '@nestjs/common';

import { ConfigModule } from '../config';
import { DataModule } from '../data/data.module';
import { EventBusModule } from '../event-bus';

import { OrderModifier } from './helpers/order-modifier/order-modifier';
import { ActiveOrderService } from './helpers/active-order/active-order.service';
import { OrderStateMachine } from './helpers/order-state-machine/order-state-machine';
import { ConfigOptionsService } from './helpers/config-options/config-options.service';
import { PaymentStateMachine } from './helpers/payment-state-machine/payment-state-machine';
import { ConfigArgService } from './helpers/config-args';

import { UserService } from './services/user.service';
import { CustomerService } from './services/customer.service';
import { AuthService } from './services/auth.service';
import { ExternalAuthenticationService } from './services/external-authentication.service';
import { ProductService } from './services/product.service';
import { SessionService } from './services/session.service';
import { PaymentMethodService } from './services/payment-method.service';
import { OrderService } from './services/order.service';
import { PaymentService } from './services/payment.service';
import { AssetService } from './services/asset.service';

const helpers = [
  ConfigOptionsService,
  ActiveOrderService,
  PaymentStateMachine,
  OrderStateMachine,
  OrderModifier,
  ExternalAuthenticationService,
  ConfigArgService,
];

const services = [
  AssetService,
  AuthService,
  CustomerService,
  OrderService,
  UserService,
  PaymentService,
  PaymentMethodService,
  ProductService,
  SessionService,
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
