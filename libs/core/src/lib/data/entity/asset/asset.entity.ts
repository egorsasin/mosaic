import { Column, Entity, OneToMany } from 'typeorm';

import { MosaicEntity } from '../entity';
import { Product } from '../product';

export enum AssetType {
  BINARY = 'BINARY',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@Entity()
export class Asset extends MosaicEntity {
  constructor(input?: Partial<Asset>) {
    super(input);
  }

  @Column() name: string;

  @Column({ type: 'enum', enum: AssetType }) type: AssetType;

  @Column() mimeType: string;

  @Column({ default: 0 }) width: number;

  @Column({ default: 0 }) height: number;

  @Column() fileSize: number;

  @Column() source: string;

  @Column() preview: string;

  @Column('simple-json', { nullable: true })
  focalPoint?: { x: number; y: number };

  @OneToMany(() => Product, (product) => product.featuredAsset)
  public featured: Product[];
}
