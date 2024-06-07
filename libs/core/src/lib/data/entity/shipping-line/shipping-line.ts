import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { summate } from '@mosaic/common';

import { MosaicEntity } from '../entity';
import { Order } from '../order';
import { Money } from '../../../config/entity/money.decorator';
import { Adjustment, roundMoney } from '../order/order-line.entity';
import { Calculated } from '../../../common';
import { ShippingMethod } from '../shipping-method';

@Entity()
export class ShippingLine extends MosaicEntity {
  constructor(input?: Partial<ShippingLine>) {
    super(input);
  }

  @Money()
  public price: number;

  @Column('simple-json')
  adjustments: Adjustment[];

  @Column('simple-json')
  metadata: string;

  @Index()
  @ManyToOne(() => ShippingMethod)
  @JoinColumn({ name: 'shipping_method_id' })
  shippingMethod: ShippingMethod;

  @OneToOne(() => Order, (order: Order) => order.shippingLine, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  public order: Order;

  @Calculated()
  public get discountedPrice(): number {
    const result = this.price + this.getAdjustmentsTotal();

    return roundMoney(result);
  }

  private getAdjustmentsTotal(): number {
    return summate(this.adjustments, 'amount');
  }
}
