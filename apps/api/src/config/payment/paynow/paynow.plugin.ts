import { HttpModule } from '@nestjs/axios';

import { MosaicPlugin, PluginCommonModule, Type } from '@mosaic/core/plugin';
import { RuntimeConfig } from '@mosaic/core/config';

import { PaynowPluginOptions } from './types';
import { paynowPaymentMethodHandler } from './paynow.handler';
import { PaynowService } from './paynow.service';
import { PaynowController } from './paynow.controller';
import { shopExtensions } from './paynow.schema';
import { PaynowIntentResolver, PaynowStateResolver } from './resolvers';

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
    schema: shopExtensions,
    resolvers: [PaynowIntentResolver, PaynowStateResolver],
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
