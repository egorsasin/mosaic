import { API_PORT } from '@mosaic/common';
import { MosaicConfig } from '@mosaic/core/config';

import { examplePaymentHandler } from './payment';

export const appConfig: MosaicConfig = {
  apiOptions: {
    port: API_PORT,
    cors: {},
  },
  paymentOptions: {
    paymentMethodHandlers: [examplePaymentHandler],
  },
};
