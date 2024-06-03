import { DataSource, IsNull } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';

import { DATA_SOURCE_PROVIDER, ShippingMethod } from '../../data';

@Injectable()
export class ShippingMethodService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
  ) {}

  public findOne(id: number): Promise<ShippingMethod | undefined> {
    return this.dataSource
      .getRepository(ShippingMethod)
      .findOne({ where: { id } });
  }

  public async getActiveShippingMethods(): Promise<ShippingMethod[]> {
    return await this.dataSource.getRepository(ShippingMethod).find({
      where: { deletedAt: IsNull() },
    });
  }
}
