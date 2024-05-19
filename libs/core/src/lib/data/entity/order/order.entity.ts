import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';

import { Calculated } from '../../../common';
import { MosaicEntity } from '../entity';
import { User } from '../user/user.entity';
import { OrderState } from '../../../types';
import { Payment } from '../payment';

import { OrderLine } from './order-line.entity';

@Entity()
export class Order extends MosaicEntity {
  constructor(input?: Partial<Order>) {
    super(input);
  }

  @Column('varchar')
  state: OrderState;

  /**
   * @description
   * A unique code for the Order, generated according to the
   * {@link OrderCodeStrategy}. This should be used as an order reference
   * for Customers, rather than the Order's id.
   */
  @Column()
  @Index({ unique: true })
  code: string;

  @Column({ nullable: true })
  orderPlacedAt?: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ unsigned: true, default: 0 })
  totalWithTax?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @OneToMany(() => OrderLine, (line) => line.order)
  lines: OrderLine[];

  get total() {
    const items = this.lines;

    return (items || []).reduce((sum, item) => {
      const { price = 0 } = item.product;
      return sum + item.quantity * price;
    }, 0);
  }

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @Calculated()
  get totalQuantity() {
    const items = this.lines;
    return (items || []).reduce((sum, item) => sum + item.quantity, 0);
  }
}
