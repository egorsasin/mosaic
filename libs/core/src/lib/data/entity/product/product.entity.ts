import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Money } from '../../../config/entity/money.decorator';
import { MosaicEntity, SoftDeletable } from '../entity';
import { Asset } from '../asset';
import { ProductAsset } from './product-asset.entity';

@Entity()
export class Product extends MosaicEntity implements SoftDeletable {
  constructor(input?: Partial<Product>) {
    super(input);
  }

  @Column({ name: 'deleted_at', type: Date, nullable: true })
  public deletedAt: Date | null;

  @Column({ nullable: false })
  public name: string;

  @Column({ unique: true, nullable: false })
  public slug: string;

  @Column({ default: '' })
  public rewiew: string;

  @Column({ default: '' })
  public description: string;

  @Index()
  @JoinColumn({ name: 'featured_asset_id' })
  @ManyToOne(() => Asset, (product) => product.featured, {
    onDelete: 'SET NULL',
  })
  featuredAsset: Asset;

  @Money()
  public price: number;

  @Column({ default: true })
  public enabled: boolean;

  @OneToMany(() => ProductAsset, (productAsset) => productAsset.product)
  public assets: ProductAsset[];
}
