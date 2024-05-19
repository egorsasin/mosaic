import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { Product } from './product.entity';
import { OrderableAsset } from '../asset/orderable-asset.entity';

@Entity()
export class ProductAsset extends OrderableAsset {
  constructor(input?: Partial<ProductAsset>) {
    super(input);
  }

  @Column({ name: 'product_id', unsigned: true })
  public productId: number;

  @Index()
  @JoinColumn({ name: 'product_id' })
  @ManyToOne(() => Product, (product) => product.assets, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
