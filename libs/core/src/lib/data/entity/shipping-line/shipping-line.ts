import { Column, Entity, OneToOne } from 'typeorm';

import { summate } from '@mosaic/common';

import { MosaicEntity } from '../entity';
import { Order } from '../order';
import { Money } from '../../../config';
import { Adjustment, roundMoney } from '../order/order-line.entity';
import { Calculated } from '../../../common';

@Entity()
export class ShippingLine extends MosaicEntity {
  constructor(input?: Partial<ShippingLine>) {
    super(input);
  }

  @Money({ name: 'list_price' })
  public listPrice: number;

  @Column('simple-json')
  adjustments: Adjustment[];

  @Column('simple-json')
  metadata: string;

  @OneToOne(() => Order, (order: Order) => order.shippingLine, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  public order: Order;

  @Calculated()
  public get discountedPrice(): number {
    const result = this.listPrice + this.getAdjustmentsTotal();

    return roundMoney(result);
  }

  private getAdjustmentsTotal(): number {
    return summate(this.adjustments, 'amount');
  }
}
