import { DynamicModule, Type } from '@nestjs/common';
import { PreviewStrategy, StorageStrategy } from './strategies';

export interface ApiOptions {
  port: number;
}

export interface MediaOptions {
  storageStrategy?: StorageStrategy;
  previewStrategy?: PreviewStrategy;
  permittedFileTypes?: string[];
  uploadMaxFileSize?: number;
}

export interface MosaicConfig {
  apiOptions: ApiOptions;
  plugins?: DynamicModule[] | Type<any>[];
  mediaOptions?: MediaOptions;
}

export interface RuntimeConfig extends Required<MosaicConfig> {
  apiOptions: Required<ApiOptions>;
  mediaOptions: Required<MediaOptions>;
}

type DeepPartialSimple<T> = {
  [P in keyof T]?:
    | null
    | (T[P] extends Array<infer U>
        ? Array<DeepPartialSimple<U>>
        : T[P] extends ReadonlyArray<infer X>
        ? ReadonlyArray<DeepPartialSimple<X>>
        : T[P] extends Type<any>
        ? T[P]
        : DeepPartialSimple<T[P]>);
};

export type PartialMosaicConfig = DeepPartialSimple<MosaicConfig>;
