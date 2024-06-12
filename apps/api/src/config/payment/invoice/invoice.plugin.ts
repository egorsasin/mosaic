import { HttpModule } from '@nestjs/axios';

import { MosaicPlugin, PluginCommonModule, Type } from '@mosaic/core/plugin';
import { RuntimeConfig } from '@mosaic/core/config';

import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.entity';

@MosaicPlugin({
  imports: [PluginCommonModule, HttpModule],
  controllers: [],
  providers: [InvoiceService],
  entities: [Invoice],
  configuration: (config: RuntimeConfig) => {
    return config;
  },
})
export class InvoicePlugin {
  /**
   * @description
   * Initialize the Invoice payment plugin
   */
  public static init(): Type<InvoicePlugin> {
    return InvoicePlugin;
  }
}
