import { Request } from 'express';

import { getAssetUrlPrefixFn } from './common';
import { AssetServerOptions } from './types';
import { LocalAssetStorageStrategy } from './local-strategy';

export function defaultAssetStorageStrategyFactory(
  options: AssetServerOptions
) {
  const { assetUploadDir } = options;
  const prefixFn = getAssetUrlPrefixFn(options);
  const toAbsoluteUrlFn = (request: Request, identifier: string): string => {
    if (!identifier) {
      return '';
    }
    const prefix = prefixFn(request, identifier);
    // Normalize the path separators
    const normalizedPath = identifier.replace(/\\/g, '/');

    return identifier.startsWith(prefix)
      ? identifier
      : `${prefix}${normalizedPath}`;
  };
  return new LocalAssetStorageStrategy(assetUploadDir, toAbsoluteUrlFn);
}
