import { API_PORT } from '@mosaic/common';
import { DefaultAssetNamingStrategy, MosaicConfig } from '@mosaic/core/config';
import { GoogleAuthPlugin } from '@mosaic/google-auth';
import { AssetServerPlugin } from '@mosaic/asset-server';

import { examplePaymentHandler, PaynowPlugin } from './payment';
import { InvoicePlugin } from './payment/invoice/invoice.plugin';
import { configureS3AssetStorage } from './s3-asset-storage-strategy';

export const appConfig: MosaicConfig = {
  apiOptions: {
    port: parseInt(process.env.PORT, 10) || API_PORT,
    cors: {},
  },
  dbConnectionOptions: {
    logging: false,
    synchronize: true,
    port: 3306,
    type: 'mysql',
    insecureAuth: true,
    ...JSON.parse(process.env.DB_CONFIG),
  },
  authOptions: {
    requireVerification: true,
  },
  plugins: [
    AssetServerPlugin.init({
      route: 'assets',
      previewMaxWidth: 300,
      previewMaxHeight: 300,
      namingStrategy: new DefaultAssetNamingStrategy(),
      storageStrategyFactory: configureS3AssetStorage({
        bucket: process.env.S3_BUCKET,
        credentials: {
          accessKeyId: process.env.ACCESS_KEY,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
        nativeS3Configuration: {
          region: 'eu-central-1',
        },
      }),
    }),
    GoogleAuthPlugin.init({
      clientId:
        '1061023759206-vqvro3vr2m3anmp1sai0npa46sc501dc.apps.googleusercontent.com',
    }),
    PaynowPlugin.init({
      // This prevents different customers from using the same PaymentIntent
    }),
    InvoicePlugin.init(),
  ],
  paymentOptions: {
    paymentMethodHandlers: [examplePaymentHandler],
  },
};