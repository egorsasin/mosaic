import { DEFAULT_AUTH_TOKEN_HEADER_KEY } from '@mosaic/common';

import {
  BcryptPasswordHashingStrategy,
  DefaultPasswordValidationStrategy,
} from './auth';
import { RuntimeConfig } from './config';
import { InMemorySessionCacheStrategy } from './session';
import { defaultPaymentProcess } from './payment';
import { DefaultOrderPlacedStrategy, defaultOrderProcess } from './order';
import {
  DefaultAssetNamingStrategy,
  NoAssetPreviewStrategy,
  NoAssetStorageStrategy,
} from './asset';
import { DefaultMoneyStrategy } from './entity';
import { defaultShippingCalculator } from './shipping-method';
import { DefaultGuestCheckoutStrategy } from './order/default-guest-checkout.strategy';
import { defaultCategoryFilters } from './catalog';

export const defaultConfig: RuntimeConfig = {
  apiOptions: {
    port: 3000,
    cors: {
      origin: true,
      credentials: true,
    },
  },
  assetOptions: {
    assetNamingStrategy: new DefaultAssetNamingStrategy(),
    assetStorageStrategy: new NoAssetStorageStrategy(),
    assetPreviewStrategy: new NoAssetPreviewStrategy(),
    permittedFileTypes: ['image/*', 'video/*', 'audio/*', '.pdf'],
    uploadMaxFileSize: 20971520,
  },
  authOptions: {
    disableAuth: false,
    authTokenHeaderKey: DEFAULT_AUTH_TOKEN_HEADER_KEY,
    authenticationStrategy: [],
    passwordHashingStrategy: new BcryptPasswordHashingStrategy(),
    passwordValidationStrategy: new DefaultPasswordValidationStrategy({
      minLength: 8,
    }),
    sessionCacheStrategy: new InMemorySessionCacheStrategy(),
    sessionDuration: '1y',
    sessionCacheTTL: 300,
    requireVerification: false,
  },
  catalogOptions: {
    categoryFilters: defaultCategoryFilters,
  },
  orderOptions: {
    orderItemsLimit: 999,
    orderLineItemsLimit: 999,
    process: [defaultOrderProcess],
    orderPlacedStrategy: new DefaultOrderPlacedStrategy(),
    guestCheckoutStrategy: new DefaultGuestCheckoutStrategy(),
  },
  paymentOptions: {
    paymentMethodHandlers: [],
    process: [defaultPaymentProcess],
  },
  shippingOptions: {
    shippingCalculators: [defaultShippingCalculator],
  },
  entityOptions: {
    moneyStrategy: new DefaultMoneyStrategy(),
  },
  dbConnectionOptions: {
    type: 'mysql',
  },
  plugins: [],
  customFields: {
    Address: [],
  },
};
