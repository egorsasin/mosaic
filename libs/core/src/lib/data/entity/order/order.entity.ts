import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
  OneToOne,
} from 'typeorm';

import { Calculated } from '../../../common';
import { MosaicEntity } from '../entity';
import { User } from '../user/user.entity';
import { OrderState } from '../../../types';
import { Payment } from '../payment';
import { Money } from '../../../config';

import { OrderLine } from './order-line.entity';
import { ShippingLine } from '../shipping-line';

export type OrderAddress = {
  city?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  postalCode?: string;
  streetLine?: string;
};

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
  public code: string;

  @Column({ nullable: true })
  public orderPlacedAt?: Date;

  @Column({ default: true })
  public active: boolean;

  @Money({ default: 0 })
  public shipping: number;

  @Money()
  public subTotal: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user?: User;

  @Column('simple-json') shippingAddress: OrderAddress;

  @OneToMany(() => OrderLine, (line) => line.order)
  public lines: OrderLine[];

  @OneToOne(
    () => ShippingLine,
    (shippingLine: ShippingLine) => shippingLine.order
  )
  shippingLine: ShippingLine;

  public get total() {
    const items = this.lines;

    return (
      (items || []).reduce((sum, item) => {
        const { price = 0 } = item.product;
        return sum + item.quantity * price;
      }, 0) + this.shipping
    );
  }

  @OneToMany(() => Payment, (payment) => payment.order)
  public payments: Payment[];

  @Calculated()
  get totalQuantity() {
    const items = this.lines;
    return (items || []).reduce((sum, item) => sum + item.quantity, 0);
  }
}
