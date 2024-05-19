import { Column, Entity, ManyToOne } from 'typeorm';

import { MosaicEntity } from '../entity';
import { Product } from '../product/product.entity';
import { Order } from './order.entity';

@Entity()
export class OrderLine extends MosaicEntity {
  constructor(input?: Partial<OrderLine>) {
    super(input);
  }

  @ManyToOne(() => Order, (order) => order.lines, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  quantity: number;
}
