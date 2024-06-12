import { Request } from 'express';

import { getAssetUrlPrefixFn } from './common';
import { AssetServerOptions } from './types';
import { LocalAssetStorageStrategy } from './local-strategy';
import { DEFAULT_ASSET_UPLOAD_DIR } from './constants';

export function defaultAssetStorageStrategyFactory(
  options: AssetServerOptions
) {
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
  return new LocalAssetStorageStrategy(
    DEFAULT_ASSET_UPLOAD_DIR,
    toAbsoluteUrlFn
  );
}
