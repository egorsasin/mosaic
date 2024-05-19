import path from 'path';

import { normalizeString } from '@mosaic/common';

import { AssetNamingStrategy } from './strategies';

export class DefaultAssetNamingStrategy implements AssetNamingStrategy {
  private readonly numberingRe = /__(\d+)(\.[^.]+)?$/;

  public generateSourceFileName(
    originalFileName: string,
    conflictFileName?: string
  ): string {
    const normalized = normalizeString(originalFileName, '-');
    if (!conflictFileName) {
      return normalized;
    } else {
      return this.incrementOrdinalSuffix(normalized, conflictFileName);
    }
  }

  public generatePreviewFileName(
    sourceFileName: string,
    conflictFileName?: string
  ): string {
    const previewSuffix = '__preview';
    const previewFileName = this.isSupportedImageFormat(sourceFileName)
      ? this.addSuffix(sourceFileName, previewSuffix)
      : this.addSuffix(sourceFileName, previewSuffix) + '.png';

    if (!conflictFileName) {
      return previewFileName;
    } else {
      return this.incrementOrdinalSuffix(previewFileName, conflictFileName);
    }
  }

  private isSupportedImageFormat(fileName: string): boolean {
    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.tiff',
      '.avif',
      '.gif',
    ];
    const ext = path.extname(fileName);
    return imageExtensions.includes(ext);
  }

  private incrementOrdinalSuffix(
    baseFileName: string,
    conflictFileName: string
  ): string {
    const matches = conflictFileName.match(this.numberingRe);
    const ord = Number(matches && matches[1]) || 1;
    return this.addOrdinalSuffix(baseFileName, ord + 1);
  }

  private addOrdinalSuffix(fileName: string, order: number): string {
    const paddedOrder = order.toString(10).padStart(2, '0');
    return this.addSuffix(fileName, `__${paddedOrder}`);
  }

  private addSuffix(fileName: string, suffix: string): string {
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    return `${baseName}${suffix}${ext}`;
  }
}
