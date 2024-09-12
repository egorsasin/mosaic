import { Column, Entity, ManyToOne, OneToMany, Index, OneToOne } from 'typeorm';

import { Calculated } from '../../../common';
import { MosaicEntity } from '../entity';
import { OrderState } from '../../../types';
import { Payment } from '../payment';
import { Money } from '../../../config/entity/money.decorator';

import { OrderLine } from './order-line.entity';
import { ShippingLine } from '../shipping-line';
import { Customer } from '../customer/customer.entity';

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

  @Column({ name: 'order_placed_at', nullable: true })
  public orderPlacedAt?: Date;

  @Column({ default: true })
  public active: boolean;

  @Index()
  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer?: Customer;

  @Column('simple-json', { nullable: true, default: null })
  shippingAddress: OrderAddress | null;

  @OneToMany(() => OrderLine, (line) => line.order)
  public lines: OrderLine[];

  @OneToOne(
    () => ShippingLine,
    (shippingLine: ShippingLine) => shippingLine.order
  )
  shippingLine: ShippingLine;

  /**
   * @description
   * Стоимость доставки.
   */
  @Money({ default: 0 })
  public shipping: number;

  @Calculated({ relations: ['lines'] })
  public get subTotal() {
    const items = this.lines;

    return (items || []).reduce((sum, item) => {
      const { price = 0 } = item.product;
      return sum + item.quantity * price;
    }, 0);
  }

  @Calculated()
  get total(): number {
    return this.subTotal + (this.shipping || 0);
  }

  @OneToMany(() => Payment, (payment) => payment.order)
  public payments: Payment[];

  @Calculated({ relations: ['lines'] })
  get totalQuantity() {
    const items = this.lines;
    return (items || []).reduce((sum, item) => sum + item.quantity, 0);
  }
}
