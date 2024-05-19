import { Column, Index, JoinColumn, ManyToOne } from 'typeorm';

import { Asset } from './asset.entity';
import { MosaicEntity } from '../entity';

export interface Orderable {
  position: number;
}
export abstract class OrderableAsset extends MosaicEntity implements Orderable {
  protected constructor(input?: Partial<OrderableAsset>) {
    super(input);
  }

  @Column({ name: 'asset_id', unsigned: true })
  assetId: number;

  @Index()
  @JoinColumn({ name: 'asset_id' })
  @ManyToOne(() => Asset, { eager: true, onDelete: 'CASCADE' })
  asset: Asset;

  @Column()
  position: number;
}
