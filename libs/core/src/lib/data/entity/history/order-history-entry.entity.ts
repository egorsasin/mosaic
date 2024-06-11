import { ChildEntity, Index, ManyToOne } from 'typeorm';

import { Order } from '../order/order.entity';

import { HistoryEntry } from './history-entry.entity';

/**
 * @description
 * Представляет собой событие в истории конкретного заказа {@link Order}.
 */
@ChildEntity()
export class OrderHistoryEntry extends HistoryEntry {
  constructor(input: Partial<OrderHistoryEntry>) {
    super(input);
  }

  @Index()
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  public order: Order;
}
