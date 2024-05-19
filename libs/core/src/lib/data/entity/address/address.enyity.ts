import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { MosaicEntity } from '../entity';
import { Customer } from '../customer';

@Entity()
export class Address extends MosaicEntity {
  constructor(input?: Partial<Address>) {
    super(input);
  }

  @Index()
  @ManyToOne(() => Customer, (customer) => customer.addresses)
  public customer: Customer;

  @Column({ default: '' }) city: string;

  @Column({ default: '' }) postalCode: string;

  @Column({ default: false })
  public default: boolean;
}
