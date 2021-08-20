import { RequestContext } from '../../../api';
import { InjectableStrategy } from '../../../common';

export interface PreviewStrategy extends InjectableStrategy {
  generatePreviewImage(
    ctx: RequestContext,
    mimeType: string,
    data: Buffer,
  ): Promise<Buffer>;
}
