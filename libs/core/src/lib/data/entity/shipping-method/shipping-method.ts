import { Column, Entity } from 'typeorm';

import { MosaicEntity, SoftDeletable } from '../entity';
import { ConfigurableOperation } from '../../../types';
import { RequestContext } from '../../../api/common';
import { Order } from '../order';

export class CustomShippingMethodFields {}

@Entity()
export class ShippingMethod extends MosaicEntity implements SoftDeletable {
  constructor(input?: Partial<ShippingMethod>) {
    super(input);
  }

  @Column({ default: '' })
  public name: string;

  @Column({ default: '' })
  public description: string;

  @Column() code: string;

  @Column() public enabled: boolean;

  @Column('simple-json') public checker: ConfigurableOperation;

  @Column('simple-json') public calculator: ConfigurableOperation;

  @Column({ name: 'deleted_at', type: Date, nullable: true })
  public deletedAt: Date;

  @Column(() => CustomShippingMethodFields)
  public customFields: CustomShippingMethodFields;

  public async apply(ctx: RequestContext, order: Order): Promise<undefined> {
    return undefined;
  }

  public async test(ctx: RequestContext, order: Order): Promise<boolean> {
    return true;
  }
}
