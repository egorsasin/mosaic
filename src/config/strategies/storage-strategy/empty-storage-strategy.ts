import { Request } from 'express';
import { Stream } from 'stream';

import { StorageStrategy } from './storage-strategy';

const errorMessage = 'No storage strategy configured';

export class EmptyStorageStrategy implements StorageStrategy {
  writeFileFromStream(fileName: string, data: Stream): Promise<string> {
    throw new Error(errorMessage);
  }

  writeFileFromBuffer(fileName: string, data: Buffer): Promise<string> {
    throw new Error(errorMessage);
  }

  readFileToBuffer(identifier: string): Promise<Buffer> {
    throw new Error(errorMessage);
  }

  readFileToStream(identifier: string): Promise<Stream> {
    throw new Error(errorMessage);
  }

  deleteFile(identifier: string): Promise<void> {
    throw new Error(errorMessage);
  }

  toAbsoluteUrl(request: Request, identifier: string): string {
    throw new Error(errorMessage);
  }

  fileExists(fileName: string): Promise<boolean> {
    throw new Error(errorMessage);
  }
}
