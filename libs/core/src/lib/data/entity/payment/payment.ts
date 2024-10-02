import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { MosaicEntity } from '../entity';
import { PaymentMetadata, PaymentState } from '../../../types';
import { Order } from '../order';
import { Money } from '../../../config/entity/money.decorator';

@Entity()
export class Payment extends MosaicEntity {
  constructor(input?: Partial<Payment>) {
    super(input);
  }

  @Column() method: string;

  @Money()
  amount: number;

  @Column('varchar') state: PaymentState;

  @Column({ type: 'varchar', nullable: true })
  errorMessage: string | undefined;

  @Column({ nullable: true })
  transactionId: string;

  @Column('simple-json') metadata: PaymentMetadata;

  @Index()
  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;
}
