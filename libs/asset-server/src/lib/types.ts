import { RequestContext } from '@mosaic/core/api/common';
import {
  AssetStorageStrategy,
  AssetPreviewStrategy,
  AssetNamingStrategy,
} from '@mosaic/core/config';

export type ImageTransformMode = 'crop' | 'resize';

export type ImageTransformFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif';

export type CacheConfig = {
  maxAge: number;
  restriction?: 'public' | 'private';
};

export interface ImageTransformPreset {
  name: string;
  width: number;
  height: number;
  mode: ImageTransformMode;
}

export interface AssetServerOptions {
  route: string;
  assetUploadDir: string; // TODO: this is strategy-specific and should be moved out of the global options
  assetUrlPrefix?:
    | string
    | ((ctx: RequestContext, identifier: string) => string);
  previewMaxWidth?: number;
  previewMaxHeight?: number;
  previewStrategy?: AssetPreviewStrategy;
  presets?: ImageTransformPreset[];
  namingStrategy?: AssetNamingStrategy;
  cacheHeader?: CacheConfig | string;
  storageStrategyFactory?: (
    options: AssetServerOptions
  ) => AssetStorageStrategy | Promise<AssetStorageStrategy>;
}
