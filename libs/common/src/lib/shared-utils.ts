type NumericPropsOf<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

type OnlyNumerics<T> = {
  [K in NumericPropsOf<T>]: T[K];
};

export function notNullOrUndefined<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null;
}

export function assertNever(value: never): never {
  throw new Error(`Expected never, got ${typeof value} (${JSON.stringify(value)})`);
}

export function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function isClassInstance(item: any): boolean {
  return isObject(item) && item.constructor.name !== 'Object';
}

export function summate<T extends OnlyNumerics<T>>(
  items: T[] | undefined | null,
  prop: keyof OnlyNumerics<T>,
): number {
  return (items || []).reduce((sum, i) => sum + i[prop], 0);
}

export function getGraphQlInputName(config: { name: string; type: string; list?: boolean }): string {
  if (config.type === 'relation') {
    return config.list === true ? `${config.name}Ids` : `${config.name}Id`;
  } else {
    return config.name;
  }
}
