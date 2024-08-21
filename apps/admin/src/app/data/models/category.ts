import {
  NumberOperators,
  PaginatedList,
  SortOrder,
  LogicalOperator,
  Category,
  ConfigurableOperationDefinition,
} from '@mosaic/common';

export type CategoryFilterParameter = {
  id?: NumberOperators;
};

export type CategorySortParameter = {
  id?: SortOrder;
};

export type CategoryLidstQueryResult = {
  categories: PaginatedList<Category>;
};

export interface CategoryListOptions {
  take?: number | null;
  skip?: number | null;
  sort?: CategorySortParameter;
  filter?: CategoryFilterParameter;
  filterOperator?: LogicalOperator;
}

export type CategoryFiltersResult = {
  categoryFilters: ConfigurableOperationDefinition[];
};
