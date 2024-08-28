export type CreateProductInput = {
  name: string;
  slug: string;
  price?: number;
};

export type UpdateProductInput = {
  assetIds?: number[];
  enabled?: boolean;
  featuredAssetId?: number;
  id: number;
  description?: string;
  name?: string;
  slug?: string;
};
