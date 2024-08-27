import { gql } from 'apollo-angular';

export const GET_CATEGORY_LIST = gql`
  query GetCategoryList($options: CategoryListOptions) {
    categories(options: $options) {
      items {
        id
        name
        slug
        description
      }
    }
  }
`;
