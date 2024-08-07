import { API_PORT } from '@mosaic/common';
import { DefaultAssetNamingStrategy, MosaicConfig } from '@mosaic/core/config';
import { GoogleAuthPlugin } from '@mosaic/google-auth';
import { AssetServerPlugin } from '@mosaic/asset-server';
import { defaultEmailHandlers, EmailPlugin } from '@mosaic/email-plugin';
import path from 'path';

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
  orderOptions: {
    orderLineItemsLimit: 5,
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
      clientId: process.env.GOOGLE_CLIENT_ID,
    }),
    PaynowPlugin.init({
      // This prevents different customers from using the same PaymentIntent
    }),
    InvoicePlugin.init(),
    EmailPlugin.init({
      handlers: defaultEmailHandlers,
      templatePath: path.join(process.cwd(), './email-templates'),
      globalTemplateVars: { fromAddress: process.env.EMAIL_USER },
      transport: {
        type: 'smtp',
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
          user: process.env.EMAIL_USER,
          ...JSON.parse(process.env.EMAIL_AUTH),
        },
      },
    }),
  ],
  paymentOptions: {
    paymentMethodHandlers: [examplePaymentHandler],
  },
};
