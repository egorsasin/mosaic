export type Maybe<T> = T | null;

export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};

export type ListOptions = {
  take: number;
  skip?: number;
};

export type PaginatedList<T> = {
  items: Array<T>;
  totalItems: number;
};
