import { Column, Entity, TableInheritance } from 'typeorm';

import { HistoryEntryType } from '@mosaic/common';

import { MosaicEntity } from '../entity';

/**
 * @description
 * An abstract entity representing an entry in the history of an Order ({@link OrderHistoryEntry})
 * or a Customer ({@link CustomerHistoryEntry}).
 *
 * @docsCategory entities
 */
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'discriminator' } })
export abstract class HistoryEntry extends MosaicEntity {
  // @Index()
  // @ManyToOne(type => Administrator)
  // administrator?: Administrator;

  @Column({ nullable: false, type: 'enum', enum: HistoryEntryType })
  readonly type: HistoryEntryType;

  @Column({ name: 'is_public' })
  isPublic: boolean;

  @Column('simple-json')
  data: unknown;
}
