import {
  NumberOperators,
  PaginatedList,
  SortOrder,
  Category,
} from '@mosaic/common';

export type CategoryFilterParameter = {
  id?: NumberOperators;
};

export type CategorySortParameter = {
  id?: SortOrder;
};

export type CategoryListQueryResult = {
  categories: PaginatedList<Category>;
};

export interface CategoryListOptions {
  take?: number | null;
  skip?: number | null;
  sort?: CategorySortParameter;
}
