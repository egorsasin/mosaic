import path from 'path';
import { Readable } from 'typeorm/platform/PlatformTools';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import LibStorage from '@aws-sdk/lib-storage';
import ClientS3, { S3ClientConfig, S3Client } from '@aws-sdk/client-s3';

import { AssetServerOptions, getAssetUrlPrefixFn } from '@mosaic/asset-server';
import { AssetStorageStrategy } from '@mosaic/core/config';

import { Request } from 'express';

export interface S3Config {
  credentials: AwsCredentialIdentity;
  bucket: string;
  nativeS3Configuration?: Record<string, unknown>;
}

export function configureS3AssetStorage(s3Config: S3Config) {
  return (options: AssetServerOptions) => {
    const prefixFn = getAssetUrlPrefixFn(options);
    const toAbsoluteUrlFn = (request: Request, identifier: string): string => {
      if (!identifier) {
        return '';
      }
      const prefix = prefixFn(request, identifier);
      return identifier.startsWith(prefix)
        ? identifier
        : `${prefix}${identifier}`;
    };

    return new S3AssetStorageStrategy(s3Config, toAbsoluteUrlFn);
  };
}

export class S3AssetStorageStrategy implements AssetStorageStrategy {
  private AWS: typeof ClientS3;
  private libStorage: typeof LibStorage;
  private s3Client: S3Client;

  constructor(
    private s3Config: S3Config,
    public readonly toAbsoluteUrl: (
      request: Request,
      identifier: string
    ) => string
  ) {}

  public async init() {
    this.AWS = await import('@aws-sdk/client-s3');
    this.libStorage = await import('@aws-sdk/lib-storage');

    const config = {
      ...this.s3Config.nativeS3Configuration,
      credentials: this.s3Config.credentials,
    } satisfies S3ClientConfig;

    this.s3Client = new this.AWS.S3Client(config);

    await this.ensureBucket();
  }

  public async writeFileFromBuffer(
    fileName: string,
    data: Buffer
  ): Promise<string> {
    return this.writeFile(fileName, data);
  }

  public async writeFileFromStream(
    fileName: string,
    data: Readable
  ): Promise<string> {
    return this.writeFile(fileName, data);
  }

  public async readFileToBuffer(identifier: string): Promise<Buffer> {
    const body = await this.readFile(identifier);

    if (!body) {
      return Buffer.from('');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  public async readFileToStream(identifier: string): Promise<Readable> {
    const body = await this.readFile(identifier);

    if (!body) {
      return new Readable({
        read() {
          this.push(null);
        },
      });
    }

    return body;
  }

  public async deleteFile(identifier: string): Promise<void> {
    const { DeleteObjectCommand } = this.AWS;

    await this.s3Client.send(
      new DeleteObjectCommand(this.getObjectParams(identifier))
    );
  }

  public async fileExists(fileName: string): Promise<boolean> {
    const { HeadObjectCommand } = this.AWS;

    try {
      await this.s3Client.send(
        new HeadObjectCommand(this.getObjectParams(fileName))
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  private async ensureBucket(bucket = this.s3Config.bucket) {
    const { HeadBucketCommand } = this.AWS;

    await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
  }

  private async readFile(identifier: string): Promise<Readable | undefined> {
    const { GetObjectCommand } = this.AWS;

    const result = await this.s3Client.send(
      new GetObjectCommand(this.getObjectParams(identifier))
    );
    return result.Body as Readable | undefined;
  }

  private async writeFile(
    fileName: string,
    data: Readable | string | Uint8Array | Buffer
  ) {
    const { Upload } = this.libStorage;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.s3Config.bucket,
        Key: fileName,
        Body: data,
      },
    } as LibStorage.Options);

    return upload.done().then((result) => {
      if (!result.Key) {
        throw new Error(`Got undefined Key for ${fileName}`);
      }

      return result.Key;
    });
  }

  private getObjectParams(identifier: string) {
    return {
      Bucket: this.s3Config.bucket,
      Key: path.join(identifier.replace(/^\//, '')),
    };
  }
}
