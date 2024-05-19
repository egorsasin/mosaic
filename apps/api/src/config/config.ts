import { API_PORT } from '@mosaic/common';
import { MosaicConfig } from '@mosaic/core/config';
import { GoogleAuthPlugin } from '@mosaic/google-auth';
import { AssetServerPlugin } from '@mosaic/asset-server';
import path from 'path';

import { examplePaymentHandler, PaynowPlugin } from './payment';

export const appConfig: MosaicConfig = {
  apiOptions: {
    port: parseInt(process.env.PORT, 10) || API_PORT,
    cors: {},
  },
  dbConnectionOptions: {
    logging: false,
    synchronize: true,
    type: 'mysql',
    host: 'localhost',
    username: 'poker',
    password: '2002',
    database: 'poker',
  },
  authOptions: {
    requireVerification: true,
  },
  plugins: [
    AssetServerPlugin.init({
      route: 'assets',
      assetUploadDir: path.join(__dirname, '../../assets'),
    }),
    GoogleAuthPlugin.init({
      clientId:
        '1061023759206-vqvro3vr2m3anmp1sai0npa46sc501dc.apps.googleusercontent.com',
    }),
    PaynowPlugin.init({
      // This prevents different customers from using the same PaymentIntent
    }),
  ],
  paymentOptions: {
    paymentMethodHandlers: [examplePaymentHandler],
  },
};
