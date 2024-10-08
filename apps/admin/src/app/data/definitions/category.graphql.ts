import { gql, TypedDocumentNode } from 'apollo-angular';

import {
  CATEGORY_FOR_LIST_FRAGMENT,
  CATEGORY_FRAGMENT,
  CONFIGURABLE_OPERATION_DEF_FRAGMENT,
} from './fragments';

export const GET_CATEGORY_LIST = gql`
  query GetCategoryList($options: CategoryListOptions) {
    categories(options: $options) {
      items {
        ...CategoryForList
      }
      totalItems
    }
  }
  ${CATEGORY_FOR_LIST_FRAGMENT}
`;

export const GET_CATEGORY_FILTERS: TypedDocumentNode = gql`
  query GetCategoryFilters {
    categoryFilters {
      ...ConfigurableOperationDef
    }
  }
  ${CONFIGURABLE_OPERATION_DEF_FRAGMENT}
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      ...Category
    }
  }
  ${CATEGORY_FRAGMENT}
`;
