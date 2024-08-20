import { Module } from '@nestjs/common';

import { ConfigModule } from '../../config/config.module';
import { ServiceModule } from '../../service/service.module';
import { createDynamicGraphQlModulesForPlugins } from '../../plugin/plugin-api.module';

import { AuthResolver } from './auth.resolver';
import { AddressResolver } from './address.resolver';
import { CustomerResolver } from './customer.resolver';
import * as EntityResolvers from './entity';

import * as AdminResolvers from './admin';
import * as StorefrontResolvers from './shell';

const ENTITY_RESOLVERS = [
  EntityResolvers.ProductEntityResolver,
  EntityResolvers.OrderEntityResolver,
  EntityResolvers.PaymentEntityResolver,
  EntityResolvers.PaymentMethodEntityResolver,
];

const SHOP_RESOLVERS = [
  AuthResolver,
  CustomerResolver,
  AddressResolver,
  StorefrontResolvers.ProductResolver,
  StorefrontResolvers.OrderResolver,
  StorefrontResolvers.PaymentMethodResolver,
  StorefrontResolvers.ShippingMethodResolver,
];

const ADMIN_RESOLVERS = [
  AdminResolvers.ProductResolver,
  AdminResolvers.AssetResolver,
  AdminResolvers.PaymentMethodResolver,
  AdminResolvers.OrderResolver,
  AdminResolvers.CategoryResolver,
];

@Module({
  imports: [
    ConfigModule,
    ServiceModule,
    ...createDynamicGraphQlModulesForPlugins('shop'),
  ],
  providers: [...SHOP_RESOLVERS, ...ENTITY_RESOLVERS],
  exports: [...SHOP_RESOLVERS],
})
export class ResolverModule {}

@Module({
  imports: [
    ConfigModule,
    ServiceModule,
    ...createDynamicGraphQlModulesForPlugins('admin'),
  ],
  providers: [...ADMIN_RESOLVERS, ...ENTITY_RESOLVERS],
  exports: [...ADMIN_RESOLVERS],
})
export class AdminResolverModule {}
