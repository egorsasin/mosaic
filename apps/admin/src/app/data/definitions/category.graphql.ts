import { gql } from 'apollo-angular';

import { CATEGORY_FOR_LIST_FRAGMENT } from './fragments';

export const GET_CATEGORY_LIST = gql`
  query GetCategoryList($options: CategoryListOptions) {
    categories(options: $options) {
      items {
        ...CollectionForList
      }
      totalItems
    }
  }
  ${CATEGORY_FOR_LIST_FRAGMENT}
`;
