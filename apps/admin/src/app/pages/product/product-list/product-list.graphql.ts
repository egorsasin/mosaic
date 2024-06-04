import { gql } from 'apollo-angular';

const PRODUCT_LIST_QUERY_PRODUCT_FRAGMENT = gql`
  fragment ProductListQueryProductFragment on Product {
    id
    name
    slug
  }
`;

export const PRODUCT_LIST_QUERY = gql`
  query ProductListQuery($options: ProductListOptions) {
    products(options: $options) {
      items {
        ...ProductListQueryProductFragment
      }
      totalItems
    }
  }
  ${PRODUCT_LIST_QUERY_PRODUCT_FRAGMENT}
`;
