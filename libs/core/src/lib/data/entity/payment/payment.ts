import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { MosaicEntity } from '../entity';
import { PaymentMetadata, PaymentState } from '../../../types';
import { Order } from '../order';

@Entity()
export class Payment extends MosaicEntity {
  constructor(input?: Partial<Payment>) {
    super(input);
  }

  @Column() method: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
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
