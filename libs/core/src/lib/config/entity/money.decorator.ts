import { Type } from '@nestjs/common';

interface MoneyColumnOptions {
  default?: number;
  /** Whether the field is nullable. Defaults to false */
  nullable?: boolean;
}

interface MoneyColumnConfig {
  name: string;
  entity: unknown;
  options?: MoneyColumnOptions;
}

const moneyColumnRegistry = new Map<unknown, MoneyColumnConfig[]>();

/**
 * @description
 * Use this decorator for any entity field that is storing a monetary value.
 * This allows the column type to be defined by the configured {@link MoneyStrategy}.
 *
 */
export function Money(options?: MoneyColumnOptions) {
  return (entity: unknown, propertyName: string) => {
    const idColumns = moneyColumnRegistry.get(entity);
    const entry = { name: propertyName, entity, options };
    if (idColumns) {
      idColumns.push(entry);
    } else {
      moneyColumnRegistry.set(entity, [entry]);
    }
  };
}

/**
 * @description
 * Returns any columns on the entity which have been decorated with the {@link EntityId}
 * decorator.
 */
export function getMoneyColumnsFor(
  entityType: Type<unknown>
): MoneyColumnConfig[] {
  const match = Array.from(moneyColumnRegistry.entries()).find(
    ([entity]) => entity.constructor === entityType
  );
  return match ? match[1] : [];
}
