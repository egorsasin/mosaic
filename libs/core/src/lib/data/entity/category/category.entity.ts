import { Column, Entity } from 'typeorm';

import { ConfigurableOperation } from '../../../types';

import { MosaicEntity } from '../entity';
import { Orderable } from '../asset/orderable-asset.entity';

@Entity()
export class Category extends MosaicEntity implements Orderable {
  constructor(input?: Partial<Category>) {
    super(input);
  }

  @Column({ name: 'is_root', default: false })
  public isRoot: boolean;

  @Column()
  public position: number;

  @Column({ name: 'is_private', default: false })
  public isPrivate: boolean;

  @Column({ nullable: false })
  public name: string;

  @Column({ default: '' })
  public description: string;

  @Column({ unique: true, nullable: false })
  public slug: string;

  @Column('simple-json') public filters: ConfigurableOperation[];

  @Column({ name: 'inherit_filters', default: true })
  public inheritFilters: boolean;
}