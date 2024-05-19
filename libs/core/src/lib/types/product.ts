export type CreateProductInput = {
  name: string;
  slug: string;
  price?: number;
};

export type QueryProductArgs = {
  id?: number;
  slug?: string;
};
