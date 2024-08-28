import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

import { Money } from '../../../config/entity/money.decorator';

@Entity()
export class SearchIndex {
  constructor(input?: Partial<SearchIndex>) {
    if (input) {
      for (const [key, value] of Object.entries(input)) {
        (this as any)[key] = value;
      }
    }
  }

  @PrimaryColumn({ nullable: false, primary: true })
  productId: number;

  @Column()
  enabled: boolean;

  @Index({ fulltext: true })
  @Column()
  productName: string;

  @Index({ fulltext: true })
  @Column('text')
  description: string;

  @Column()
  slug: string;

  @Column()
  sku: string;

  @Money()
  price: number;

  @Column('simple-array')
  categoryIds: string[];

  @Column('simple-array')
  categorySlugs: string[];

  @Column()
  productPreview: string;

  @Column('simple-json', { nullable: true })
  productPreviewFocalPoint?: { x: number; y: number } | null;

  @Column({ nullable: true })
  productAssetId: number | null;
}
