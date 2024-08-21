import { Maybe } from './common';

import { Category } from './cartegory';

export type SearchResult = {
  sku: string;
  slug: string;
  productId: number;
  productName: string;
  productAsset: SearchResultAsset;
  price: number;
  description: string;
  categoryIds: number[];
  score: number;
};

export type CategoryResult = {
  __typename?: 'CollectionResult';
  category: Category;
  count: number;
};

export type Coordinate = {
  __typename?: 'Coordinate';
  x: number;
  y: number;
};

export type SearchResultAsset = {
  __typename?: 'SearchResultAsset';
  focalPoint?: Maybe<Coordinate>;
  id: number;
  preview: string;
};

export type SearchResponse = {
  __typename?: 'SearchResponse';
  collections: Array<CategoryResult>;
  items: SearchResult[];
  totalItems: number;
};
