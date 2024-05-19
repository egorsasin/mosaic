export type PaginatedList<T> = {
  items: T[];
  totalItems: number;
};

export interface ListQueryOptions {
  take?: number | null;
  skip?: number | null;
}

export enum AssetType {
  BINARY = 'BINARY',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}
