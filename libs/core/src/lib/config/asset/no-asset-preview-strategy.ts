import { RequestContext } from '../../api/common';
import { InternalServerError } from '../../common';

import { AssetPreviewStrategy } from './strategies';

export class NoAssetPreviewStrategy implements AssetPreviewStrategy {
  public generatePreviewImage(mimeType: string, data: Buffer): Promise<Buffer> {
    throw new InternalServerError('error.no-asset-preview-strategy-configured');
  }
}
