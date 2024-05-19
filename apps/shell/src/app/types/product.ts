export type Product = Node & {
  __typename?: 'Product';
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
  description: string;
  price: number;
  featuredAsset: any;
};
