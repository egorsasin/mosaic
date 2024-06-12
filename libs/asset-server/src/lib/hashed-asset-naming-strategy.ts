import { createHash } from 'crypto';
import path from 'path';

import { DefaultAssetNamingStrategy } from '@mosaic/core/config';

export class HashedAssetNamingStrategy extends DefaultAssetNamingStrategy {
  public override generateSourceFileName(
    originalFileName: string,
    conflictFileName?: string
  ): string {
    const filename = super.generateSourceFileName(
      originalFileName,
      conflictFileName
    );
    return path.posix.join('source', this.getHashedDir(filename), filename);
  }

  public override generatePreviewFileName(
    originalFileName: string,
    conflictFileName?: string
  ): string {
    const filename = super.generatePreviewFileName(
      originalFileName,
      conflictFileName
    );
    return path.posix.join('preview', this.getHashedDir(filename), filename);
  }

  private getHashedDir(filename: string): string {
    return createHash('md5').update(filename).digest('hex').slice(0, 2);
  }
}
