import { Column } from 'typeorm';
import { Type } from '@nestjs/common';

import { getMoneyColumnsFor } from './money.decorator';
import { MoneyStrategy } from './money-strategy';

export function setMoneyStrategy(
  moneyStrategy: MoneyStrategy,
  entities: Array<Type<unknown>>
) {
  for (const EntityCtor of entities) {
    const columnConfig = getMoneyColumnsFor(EntityCtor);

    for (const { name, options, entity } of columnConfig) {
      Column({
        ...moneyStrategy.moneyColumnOptions,
        name: options?.name,
        nullable: options?.nullable ?? false,
        default: options?.default,
      })(entity, name);
    }
  }
}
