import { ColumnOptions } from 'typeorm';

import { InjectableStrategy } from '../../common';

export interface MoneyStrategy extends InjectableStrategy {
  readonly moneyColumnOptions: ColumnOptions;

  readonly precision?: number;

  round(value: number, quantity?: number): number;
}
