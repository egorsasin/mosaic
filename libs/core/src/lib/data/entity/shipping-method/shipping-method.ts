import { Column, Entity } from 'typeorm';

import { MosaicEntity, SoftDeletable } from '../entity';
import { ConfigurableOperation } from '../../../types';
import { RequestContext } from '../../../api/common';
import {
  ShippingCalculationResult,
  ShippingCalculator,
  getConfig,
} from '../../../config';
import { Order } from '../order';
import { roundMoney } from '../order/order-line.entity';

export class CustomShippingMethodFields {}

@Entity()
export class ShippingMethod extends MosaicEntity implements SoftDeletable {
  private readonly allCalculators: { [code: string]: ShippingCalculator } = {};

  constructor(input?: Partial<ShippingMethod>) {
    super(input);

    const calculators = getConfig().shippingOptions.shippingCalculators || [];

    this.allCalculators = calculators.reduce(
      (hash, o) => ({ ...hash, [o.code]: o }),
      {}
    );
  }

  @Column({ default: '' })
  public name: string;

  @Column({ default: '' })
  public description: string;

  @Column({ nullable: false, unique: true }) code: string;

  @Column() public enabled: boolean;

  @Column('simple-json') public checker: ConfigurableOperation;

  @Column('simple-json') public calculator: ConfigurableOperation;

  @Column({ name: 'deleted_at', type: Date, nullable: true })
  public deletedAt: Date;

  @Column(() => CustomShippingMethodFields)
  public customFields: CustomShippingMethodFields;

  public async apply(
    ctx: RequestContext,
    order: Order
  ): Promise<ShippingCalculationResult | undefined> {
    const calculator = this.allCalculators[this.calculator.code];

    if (calculator) {
      const response = await calculator.calculate(
        ctx,
        order,
        this.calculator.args,
        this
      );

      if (response) {
        const { price, metadata } = response;
        return {
          price: roundMoney(price),
          metadata,
        };
      }
    }
  }

  public async test(ctx: RequestContext, order: Order): Promise<boolean> {
    return true;
  }
}
