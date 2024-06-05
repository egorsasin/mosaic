import { Column, Entity, ManyToOne } from 'typeorm';

import { MosaicEntity } from '../entity';
import { Product } from '../product/product.entity';
import { Order } from './order.entity';
import { Calculated } from '../../../common';
import { MoneyStrategy, getConfig } from '../../../config';
import { Money } from '../../../config/entity/money.decorator';

export enum AdjustmentType {
  DISTRIBUTED_ORDER_PROMOTION = 'DISTRIBUTED_ORDER_PROMOTION',
  OTHER = 'OTHER',
  PROMOTION = 'PROMOTION',
}

export type Adjustment = {
  adjustmentSource: string;
  amount: number;
  data?: string;
  description: string;
  type: AdjustmentType;
};

let moneyStrategy: MoneyStrategy;

export function roundMoney(value: number, quantity = 1): number {
  if (!moneyStrategy) {
    moneyStrategy = getConfig().entityOptions.moneyStrategy;
  }
  return moneyStrategy.round(value, quantity);
}
@Entity()
export class OrderLine extends MosaicEntity {
  constructor(input?: Partial<OrderLine>) {
    super(input);
  }

  @ManyToOne(() => Order, (order) => order.lines, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column('simple-json')
  adjustments: Adjustment[];

  /**
   * @description
   * Количество товара во время создания заказа (как рассчитано в {@link OrderPlacedStrategy})
   */
  @Column({ default: 0 })
  orderPlacedQuantity: number;

  /**
   * @description
   * Цена указанная в товаре (и возможно модифицированная {@link OrderItemPriceCalculationStrategy})
   */
  @Money()
  listPrice: number;

  /**
   * @description
   * Актуальная цена с учетом скидки на товар и пропорционально распределенной скидки на заказ.
   * Эта цена является конечной ценой товара и используется для расчета налогов и возврата
   */
  @Calculated()
  public get proratedLinePrice(): number {
    return roundMoney(this.proratedUnitPrice(), this.quantity);
  }

  @Column()
  quantity: number;

  private proratedUnitPrice(): number {
    return this.listPrice + this.getUnitAdjustmentsTotal();
  }

  /**
   * @description
   * Итог всех корректировок цены. В основном отридцательное число из-за применения скидок
   */
  private getUnitAdjustmentsTotal(type?: AdjustmentType): number {
    if (!this.adjustments || this.quantity === 0) {
      return 0;
    }
    return this.adjustments
      .filter((adjustment) => (type ? adjustment.type === type : true))
      .map(
        (adjustment) =>
          adjustment.amount / Math.max(this.orderPlacedQuantity, this.quantity)
      )
      .reduce((total, a) => total + a, 0);
  }
}
