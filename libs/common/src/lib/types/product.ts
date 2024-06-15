import { Asset } from './asset';

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  featuredAsset: Asset;
  assets: Asset[];
}
