import path from 'path';
import sharp from 'sharp';

import { AssetPreviewStrategy } from '@mosaic/core/config';
import { AssetType, getAssetType } from '@mosaic/core/common';

interface SharpAssetPreviewConfig {
  maxHeight?: number;
  maxWidth?: number;
  jpegOptions?: sharp.JpegOptions;
  pngOptions?: sharp.PngOptions;
  webpOptions?: sharp.WebpOptions;
  gifOptions?: sharp.GifOptions;
  avifOptions?: sharp.AvifOptions;
}

export class SharpAssetPreviewStrategy implements AssetPreviewStrategy {
  private readonly defaultConfig: Required<SharpAssetPreviewConfig> = {
    maxHeight: 1600,
    maxWidth: 1600,
    jpegOptions: {},
    pngOptions: {},
    webpOptions: {},
    gifOptions: {},
    avifOptions: {},
  };
  private readonly config: Required<SharpAssetPreviewConfig>;

  constructor(config?: SharpAssetPreviewConfig) {
    this.config = {
      ...this.defaultConfig,
      ...(config ?? {}),
    };
  }

  public async generatePreviewImage(
    mimeType: string,
    data: Buffer
  ): Promise<Buffer> {
    const assetType = getAssetType(mimeType);

    const { maxWidth, maxHeight } = this.config;

    if (assetType === AssetType.IMAGE) {
      try {
        const image = sharp(data, { failOn: 'truncated' }).rotate();
        const metadata = await image.metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        if (maxWidth < width || maxHeight < height) {
          image.resize(maxWidth, maxHeight, { fit: 'inside' });
        }
        if (mimeType === 'image/svg+xml') {
          // Convert the SVG to a raster for the preview
          return image.toBuffer();
        } else {
          switch (metadata.format) {
            case 'jpeg':
            case 'jpg':
              return image.jpeg(this.config.jpegOptions).toBuffer();
            case 'png':
              return image.png(this.config.pngOptions).toBuffer();
            case 'webp':
              return image.webp(this.config.webpOptions).toBuffer();
            case 'gif':
              return image.gif(this.config.jpegOptions).toBuffer();
            case 'avif':
              return image.avif(this.config.avifOptions).toBuffer();
            default:
              return image.toBuffer();
          }
        }
      } catch (err: any) {
        return this.generateBinaryFilePreview(mimeType);
      }
    } else {
      return this.generateBinaryFilePreview(mimeType);
    }
  }

  private generateMimeTypeOverlay(mimeType: string): Buffer {
    return Buffer.from(`
            <svg xmlns="http://www.w3.org/2000/svg" height="150" width="800">
            <style>
                text {
                   font-size: 64px;
                   font-family: Arial, sans-serif;
                   fill: #666;
                }
              </style>

              <text x="400" y="110"  text-anchor="middle" width="800">${mimeType}</text>
            </svg>`);
  }

  private generateBinaryFilePreview(mimeType: string): Promise<Buffer> {
    return sharp(path.join(__dirname, 'file-icon.png'))
      .resize(800, 800, { fit: 'outside' })
      .composite([
        {
          input: this.generateMimeTypeOverlay(mimeType),
          gravity: sharp.gravity.center,
        },
      ])
      .toBuffer();
  }
}
