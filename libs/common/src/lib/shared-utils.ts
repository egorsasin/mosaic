type NumericPropsOf<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

// Homomorphic helper type
// From https://stackoverflow.com/a/56140392/772859
type NPO<T, KT extends keyof T> = {
  [K in KT]: T[K] extends string | number | boolean
    ? T[K]
    : T[K] extends Array<infer A>
    ? Array<OnlyNumerics<A>>
    : OnlyNumerics<T[K]>;
};

type OnlyNumerics<T> = NPO<T, NumericPropsOf<T>>;

export function notNullOrUndefined<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null;
}

export function assertNever(value: never): never {
  throw new Error(
    `Expected never, got ${typeof value} (${JSON.stringify(value)})`
  );
}

export function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function isClassInstance(item: any): boolean {
  return isObject(item) && item.constructor.name !== 'Object';
}

/**
 * Складывает все значения числового свойства списка объектов.
 */
export function summate<T extends OnlyNumerics<T>>(
  items: T[] | undefined | null,
  prop: keyof OnlyNumerics<T>
): number {
  return (items || []).reduce(
    (sum, i) => sum + (i[prop] as unknown as number),
    0
  );
}

export function getGraphQlInputName(config: {
  name: string;
  type: string;
  list?: boolean;
}): string {
  if (config.type === 'relation') {
    return config.list === true ? `${config.name}Ids` : `${config.name}Id`;
  } else {
    return config.name;
  }
}
