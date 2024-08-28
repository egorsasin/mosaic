import {
  NumberOperators,
  PaginatedList,
  SortOrder,
  LogicalOperator,
  Category,
  ConfigurableOperationDefinition,
  ConfigurableOperationInput,
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
  filter?: CategoryFilterParameter;
  filterOperator?: LogicalOperator;
}

export type CategoryFiltersResult = {
  categoryFilters: ConfigurableOperationDefinition[];
};

export type UpdateCategoryInput = {
  filters?: ConfigurableOperationInput[];
  id: number;
  isPrivate?: boolean;
  name?: string;
  slug?: string;
  description?: string;
};

export type UpdateCategoryMutation = { updateCollection: Category };
