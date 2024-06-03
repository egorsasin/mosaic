import { Order, ShippingMethod } from '../../data';
import { RequestContext } from '../../api/common';
import {
  ConfigurableOperationDef,
  ConfigurableOperationDefOptions,
} from '../../common';
import { ConfigArg, ConfigArgValues, ConfigArgs } from '../../types';

export type CalculateShippingFnResult =
  | ShippingCalculationResult
  | Promise<ShippingCalculationResult | undefined>
  | undefined;

export type CalculateShippingFn<T extends ConfigArgs> = (
  ctx: RequestContext,
  order: Order,
  args: ConfigArgValues<T>,
  method: ShippingMethod
) => CalculateShippingFnResult;

export interface ShippingCalculationResult {
  price: number;
  metadata?: Record<string, unknown>;
}

export interface ShippingCalculatorConfig<T extends ConfigArgs>
  extends ConfigurableOperationDefOptions<T> {
  calculate: CalculateShippingFn<T>;
}

export class ShippingCalculator<
  T extends ConfigArgs = ConfigArgs
> extends ConfigurableOperationDef<T> {
  private readonly calculateFn: CalculateShippingFn<T>;

  constructor(config: ShippingCalculatorConfig<T>) {
    super(config);
    this.calculateFn = config.calculate;
  }

  /**
   * @description
   * Рассчитывает стоимость доставки для текущего заказа.
   *
   * @internal
   */
  public calculate(
    ctx: RequestContext,
    order: Order,
    args: ConfigArg[],
    method: ShippingMethod
  ): CalculateShippingFnResult {
    return this.calculateFn(ctx, order, this.argsArrayToHash(args), method);
  }
}
