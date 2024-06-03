import { Injectable } from '@nestjs/common';

import { notNullOrUndefined } from '@mosaic/common';

import { Order, ShippingMethod } from '../../../data';
import { ShippingMethodService } from '../../services/shipping-method.service';
import { RequestContext } from '../../../api/common';

export interface ShippingCalculationResult {
  price: number;
  metadata?: Record<string, unknown>;
}

export type EligibleShippingMethod = {
  method: ShippingMethod;
  result: ShippingCalculationResult;
};

@Injectable()
export class ShippingCalculator {
  constructor(private shippingMethodService: ShippingMethodService) {}

  /**
   * Возвращает массив доступных способов доставки для текущего заказа
   * отсортированных по возрастанию стоимости доставки
   *
   * `skipIds` используется для пропуска способов доставки с указанными ИД
   */
  public async getEligibleShippingMethods(
    ctx: RequestContext,
    order: Order,
    skipIds: number[] = []
  ): Promise<EligibleShippingMethod[]> {
    const shippingMethods = (
      await this.shippingMethodService.getActiveShippingMethods()
    ).filter((method) => !skipIds.includes(method.id));

    const checkEligibilityPromises = shippingMethods.map((method) =>
      this.checkEligibilityByShippingMethod(ctx, order, method)
    );

    const eligibleMethods = await Promise.all(checkEligibilityPromises);

    return eligibleMethods
      .filter(notNullOrUndefined)
      .sort((a, b) => a.result.price - b.result.price);
  }

  public async getMethodIfEligible(
    ctx: RequestContext,
    order: Order,
    shippingMethodId: number
  ): Promise<ShippingMethod | undefined> {
    const method = await this.shippingMethodService.findOne(shippingMethodId);
    if (method) {
      const eligible = await method.test(ctx, order);
      if (eligible) {
        return method;
      }
    }
  }

  private async checkEligibilityByShippingMethod(
    ctx: RequestContext,
    order: Order,
    method: ShippingMethod
  ): Promise<EligibleShippingMethod | undefined> {
    const eligible = await method.test(ctx, order);

    if (eligible) {
      const result = await method.apply(ctx, order);

      if (result) {
        return { method, result };
      }
    }
  }
}
