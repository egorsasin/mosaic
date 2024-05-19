import { Column, Entity } from 'typeorm';

import { MosaicEntity } from '../entity';
import { ConfigurableOperation } from '../../../types';

@Entity()
export class PaymentMethod extends MosaicEntity {
  constructor(input?: Partial<PaymentMethod>) {
    super(input);
  }

  @Column({ default: '' })
  public name: string;

  @Column({ default: '' })
  public description: string;

  @Column({ default: '' }) public code: string;

  @Column() public enabled: boolean;

  @Column('simple-json') public handler: ConfigurableOperation;
}
