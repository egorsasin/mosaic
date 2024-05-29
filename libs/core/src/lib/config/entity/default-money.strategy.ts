import { ColumnOptions } from 'typeorm';

import { MoneyStrategy } from './money-strategy';

export class DefaultMoneyStrategy implements MoneyStrategy {
  public readonly moneyColumnOptions: ColumnOptions = {
    type: 'int',
  };
  public readonly precision: number = 2;

  public round(value: number, quantity = 1): number {
    return Math.round(value) * quantity;
  }
}
