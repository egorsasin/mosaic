import { Request } from 'express';
import { Stream } from 'stream';

import { InjectableStrategy } from '../../common';

export interface AssetStorageStrategy extends InjectableStrategy {
  writeFileFromBuffer(fileName: string, data: Buffer): Promise<string>;
  writeFileFromStream(fileName: string, data: Stream): Promise<string>;
  readFileToBuffer(identifier: string): Promise<Buffer>;
  readFileToStream(identifier: string): Promise<Stream>;
  deleteFile(identifier: string): Promise<void>;
  fileExists(fileName: string): Promise<boolean>;
  toAbsoluteUrl?(request: Request, identifier: string): string;
}

export interface AssetNamingStrategy extends InjectableStrategy {
  generateSourceFileName(
    originalFileName: string,
    conflictFileName?: string
  ): string;
  generatePreviewFileName(
    sourceFileName: string,
    conflictFileName?: string
  ): string;
}

export interface AssetPreviewStrategy extends InjectableStrategy {
  generatePreviewImage(mimeType: string, data: Buffer): Promise<Buffer>;
}
