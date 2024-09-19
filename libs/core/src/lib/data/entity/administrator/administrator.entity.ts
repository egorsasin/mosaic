import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { CustomFieldsObject } from '@mosaic/common';

import { User } from '../user/user.entity';
import { HasCustomFields } from '../../../config/custom-field';
import { MosaicEntity, SoftDeletable } from '../entity';

@Entity()
export class Administrator
  extends MosaicEntity
  implements SoftDeletable, HasCustomFields
{
  constructor(input?: Partial<Administrator>) {
    super(input);
  }

  @Column({ type: Date, nullable: true })
  deletedAt: Date | null;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('varchar')
  customFields: CustomFieldsObject;
}
