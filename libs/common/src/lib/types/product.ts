import { Asset } from './asset';

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  featuredAsset: Asset;
  assets: Asset[];
}

export type SearchInput = {
  categoryId?: number;
  categorySlug?: string;
  groupByProduct?: boolean;
  skip?: number;
  sort?: number;
  take?: number;
  term?: string;
};
