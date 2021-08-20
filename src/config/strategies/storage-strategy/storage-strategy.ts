import { Request } from 'express';
import { Stream } from 'stream';

import { InjectableStrategy } from '../../../common';

export interface StorageStrategy extends InjectableStrategy {
  writeFileFromBuffer(fileName: string, data: Buffer): Promise<string>;
  writeFileFromStream(fileName: string, data: Stream): Promise<string>;
  readFileToBuffer(identifier: string): Promise<Buffer>;
  readFileToStream(identifier: string): Promise<Stream>;
  deleteFile(identifier: string): Promise<void>;
  fileExists(fileName: string): Promise<boolean>;
  toAbsoluteUrl?(request: Request, identifier: string): string;
}
