import { Injector, RequestContext } from '@mosaic/core';

import { EmailPluginOptions, EmailTransportOptions } from './types';

export async function resolveTransportSettings(
  options: EmailPluginOptions,
  injector: Injector,
  ctx?: RequestContext
): Promise<EmailTransportOptions> {
  if (typeof options.transport === 'function') {
    return options.transport(injector, ctx);
  } else {
    return options.transport;
  }
}
