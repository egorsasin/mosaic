import {
  MiddlewareConsumer,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import { createHash } from 'crypto';
import { fromBuffer } from 'file-type';
import fs from 'fs-extra';

import { MosaicPlugin, PluginCommonModule, Type } from '@mosaic/core/plugin';
import { AssetStorageStrategy, RuntimeConfig } from '@mosaic/core/config';

import { AssetServerOptions, ImageTransformPreset } from './types';
import { getValidFormat } from './common';
import { transformImage } from './transform-image';
import { defaultAssetStorageStrategyFactory } from './default-factory';
import { SharpAssetPreviewStrategy } from './sharp-asset-preview-strategy';
import { HashedAssetNamingStrategy } from './hashed-asset-naming-strategy';
import { DEFAULT_CACHE_HEADER } from './constants';

@MosaicPlugin({
  imports: [PluginCommonModule],
  configuration: (config) => AssetServerPlugin.configure(config),
})
export class AssetServerPlugin implements NestModule, OnApplicationBootstrap {
  private static assetStorage: AssetStorageStrategy;
  private readonly cacheDir = 'cache';
  private presets: ImageTransformPreset[] = [
    { name: 'tiny', width: 100, height: 100, mode: 'crop' },
    { name: 'thumb', width: 150, height: 150, mode: 'crop' },
    { name: 'small', width: 300, height: 300, mode: 'resize' },
    { name: 'medium', width: 500, height: 500, mode: 'resize' },
    { name: 'large', width: 800, height: 800, mode: 'resize' },
  ];
  private static options: AssetServerOptions;
  private cacheHeader = '';

  static init(options: AssetServerOptions): Type<AssetServerPlugin> {
    AssetServerPlugin.options = options;
    return this;
  }

  static async configure(config: RuntimeConfig) {
    const storageStrategyFactory =
      this.options.storageStrategyFactory || defaultAssetStorageStrategyFactory;

    this.assetStorage = await storageStrategyFactory(this.options);

    config.assetOptions.assetPreviewStrategy =
      this.options.previewStrategy ??
      new SharpAssetPreviewStrategy({
        maxWidth: this.options.previewMaxWidth,
        maxHeight: this.options.previewMaxHeight,
      });
    config.assetOptions.assetStorageStrategy = this.assetStorage;
    config.assetOptions.assetNamingStrategy =
      this.options.namingStrategy || new HashedAssetNamingStrategy();

    return config;
  }

  public onApplicationBootstrap(): void {
    if (AssetServerPlugin.options.presets) {
      for (const preset of AssetServerPlugin.options.presets) {
        const existingIndex = this.presets.findIndex(
          (p) => p.name === preset.name
        );
        if (-1 < existingIndex) {
          this.presets.splice(existingIndex, 1, preset);
        } else {
          this.presets.push(preset);
        }
      }
    }

    const { cacheHeader } = AssetServerPlugin.options;
    if (!cacheHeader) {
      this.cacheHeader = DEFAULT_CACHE_HEADER;
    } else {
      if (typeof cacheHeader === 'string') {
        this.cacheHeader = cacheHeader;
      } else {
        this.cacheHeader = [
          cacheHeader.restriction,
          `max-age: ${cacheHeader.maxAge}`,
        ]
          .filter((value) => !!value)
          .join(', ');
      }
    }

    const cachePath = path.join(
      AssetServerPlugin.options.assetUploadDir,
      this.cacheDir
    );
    fs.ensureDirSync(cachePath);
  }

  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.createAssetServer())
      .forRoutes(AssetServerPlugin.options.route);
  }

  /**
   * Creates the image server instance
   */
  private createAssetServer() {
    const assetServer = express.Router();
    assetServer.use(this.sendAsset(), this.generateTransformedImage());
    return assetServer;
  }

  private sendAsset() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = this.getFileNameFromRequest(req);
      try {
        const file = await AssetServerPlugin.assetStorage.readFileToBuffer(key);
        let mimeType = this.getMimeType(key);

        if (!mimeType) {
          mimeType =
            (await fromBuffer(file))?.mime || 'application/octet-stream';
        }

        res.contentType(mimeType);
        res.setHeader('content-security-policy', "default-src 'self'");
        res.setHeader('Cache-Control', this.cacheHeader);
        res.send(file);
      } catch (e: any) {
        const err = new Error('File not found');
        (err as any).status = 404;
        return next(err);
      }
    };
  }

  private generateTransformedImage() {
    return async (
      err: any,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (err && (err.status === 404 || err.statusCode === 404)) {
        if (req.query) {
          const decodedReqPath = decodeURIComponent(req.path);

          let file: Buffer;

          try {
            file = await AssetServerPlugin.assetStorage.readFileToBuffer(
              decodedReqPath
            );
          } catch (error) {
            res.status(404).send('Resource not found');
            return;
          }
          const image = await transformImage(
            file,
            req.query as Record<string, string>,
            this.presets || []
          );
          try {
            const imageBuffer = await image.toBuffer();
            const cachedFileName = this.getFileNameFromRequest(req);

            if (!req.query['cache'] || req.query['cache'] === 'true') {
              await AssetServerPlugin.assetStorage.writeFileFromBuffer(
                cachedFileName,
                imageBuffer
              );
            }
            let mimeType = this.getMimeType(cachedFileName);
            if (!mimeType) {
              mimeType = (await fromBuffer(imageBuffer))?.mime || 'image/jpeg';
            }
            res.set('Content-Type', mimeType);
            res.setHeader('content-security-policy', "default-src 'self'");
            res.send(imageBuffer);
            return;
          } catch (err: any) {
            res.status(500).send(err.message);
            return;
          }
        }
      }
      next();
    };
  }

  private getFileNameFromRequest(req: Request): string {
    const { w, h, mode, preset, fpx, fpy, format } = req.query;
    const focalPoint = fpx && fpy ? `_fpx${fpx}_fpy${fpy}` : '';
    const imageFormat = getValidFormat(format);

    let imageParamHash: string | null = null;

    if (w || h) {
      const width = w || '';
      const height = h || '';
      imageParamHash = this.md5(
        `_transform_w${width}_h${height}_m${mode}${focalPoint}${imageFormat}`
      );
    } else if (preset) {
      if (this.presets && !!this.presets.find((p) => p.name === preset)) {
        imageParamHash = this.md5(
          `_transform_pre_${preset}${focalPoint}${imageFormat}`
        );
      }
    } else if (imageFormat) {
      imageParamHash = this.md5(`_transform_${imageFormat}`);
    }

    const decodedReqPath = decodeURIComponent(req.path);
    if (imageParamHash) {
      return path.join(
        this.cacheDir,
        this.addSuffix(decodedReqPath, imageParamHash, imageFormat)
      );
    } else {
      return decodedReqPath;
    }
  }

  private md5(input: string): string {
    return createHash('md5').update(input).digest('hex');
  }

  private addSuffix(fileName: string, suffix: string, ext?: string): string {
    const originalExt = path.extname(fileName);
    const effectiveExt = ext ? `.${ext}` : originalExt;
    const baseName = path.basename(fileName, originalExt);
    const dirName = path.dirname(fileName);
    return path.join(dirName, `${baseName}${suffix}${effectiveExt}`);
  }

  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName);
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      case '.tiff':
        return 'image/tiff';
      case '.webp':
        return 'image/webp';
    }

    return '';
  }
}
