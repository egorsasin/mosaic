export type PaginatedList<T> = {
  items: T[];
  totalItems: number;
};

export enum AssetType {
  BINARY = 'BINARY',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}
