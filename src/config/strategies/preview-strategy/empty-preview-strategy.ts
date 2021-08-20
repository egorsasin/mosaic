import { RequestContext } from '../../../api';
import { PreviewStrategy } from './preview-strategy';

export class EmptyPreviewStrategy implements PreviewStrategy {
  generatePreviewImage(
    ctx: RequestContext,
    mimeType: string,
    data: Buffer,
  ): Promise<Buffer> {
    throw new Error('error.no-asset-preview-strategy-configured');
  }
}
