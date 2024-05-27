import { gql } from 'graphql-tag';
import { HttpModule } from '@nestjs/axios';

import { MosaicPlugin, PluginCommonModule, Type } from '@mosaic/core/plugin';
import { RuntimeConfig } from '@mosaic/core/config';

import { PaynowPluginOptions } from './types';
import { paynowPaymentMethodHandler } from './paynow.handler';
import { PaynowCommonResolver } from './resolvers';
import { PaynowService } from './paynow.service';
import { PaynowController } from './paynow.controller';

@MosaicPlugin({
  imports: [PluginCommonModule, HttpModule],
  controllers: [PaynowController],
  providers: [PaynowService],
  configuration: (config: RuntimeConfig) => {
    config.paymentOptions.paymentMethodHandlers.push(
      paynowPaymentMethodHandler
    );
    return config;
  },
  shopApiExtensions: {
    schema: gql`
      input PaynowPaymentIntentInput {
        orderId: Int!
      }
      type PaynowPaymentIntent {
        url: String!
      }
      extend type Mutation {
        createPaynowIntent(
          input: PaynowPaymentIntentInput!
        ): PaynowPaymentIntentResult!
      }
      union PaynowPaymentIntentResult = PaynowPaymentIntent | NoActiveOrderError
    `,
    resolvers: [PaynowCommonResolver],
  },
})
export class PaynowPlugin {
  public static options: PaynowPluginOptions;

  /**
   * @description
   * Initialize the Paynow payment plugin
   */
  public static init(options: PaynowPluginOptions): Type<PaynowPlugin> {
    this.options = options;
    return PaynowPlugin;
  }
}
