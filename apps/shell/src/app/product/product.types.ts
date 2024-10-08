import { Order } from '@mosaic/common';

import { Exact, ListOptions, Maybe, PaginatedList, Product } from '../types';

export type ProductList = PaginatedList<Product>;
export namespace GetProductList {
  export type Query = { search: ProductList };
  export type Variables = Exact<{
    options?: Maybe<ListOptions>;
  }>;
}

export namespace AddToCart {
  export type Mutation = { addItemToOrder: Order };
  export type Variables = Exact<{
    productId: number;
    quantity: number;
  }>;
}
