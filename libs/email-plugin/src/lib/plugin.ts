import { Type } from '@nestjs/common';

import { MosaicPlugin, PluginCommonModule } from '@mosaic/core';

import { EmailPluginOptions } from './types';

@MosaicPlugin({
  imports: [PluginCommonModule],
})
export class EmailPlugin {
  static init(options: EmailPluginOptions): Type<EmailPlugin> {
    return EmailPlugin;
  }
}
