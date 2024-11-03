import { Exact, Maybe, PaginatedList, Product } from '@mosaic/common';

import { ListOptions } from '../../types';

export type ProductList = PaginatedList<Product>;

export type ProductListQuery = { search: ProductList };

export type ProductListQueryVariables = Exact<{
  options?: Maybe<ListOptions>;
}>;
