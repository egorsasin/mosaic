import {
  ConfigurableOperation,
  ConfigurableOperationInput,
} from './configurable-operation';

export interface CreateCategoryInput {
  filters: ConfigurableOperationInput[];
  inheritFilters?: boolean;
  slug: string;
  isPrivate: boolean;
  name: string;
  description: string;
}

export interface UpdateCategoryInput extends CreateCategoryInput {
  id: number;
}

export interface Category {
  __typename?: 'Category';
  createdAt: Date;
  description: string;
  filters: ConfigurableOperation[];
  id: number;
  slug: string;
  isPrivate: boolean;
  name: string;
}

export type QueryCategoryArgs = {
  id?: number;
  slug?: string;
};
