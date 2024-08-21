import { TypedDocumentNode, gql } from 'apollo-angular';

import {
  PRODUCT_DETAIL_FRAGMENT,
  PRODUCT_LIST_QUERY_PRODUCT_FRAGMENT,
} from './fragments';

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

export const GET_PRODUCT_DETAIL: TypedDocumentNode = gql`
  query GetProductDetail($id: Int!) {
    product(id: $id) {
      ...ProductDetail
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      ...ProductDetail
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        ...ProductListQueryProductFragment
      }
    }
  }
  ${PRODUCT_LIST_QUERY_PRODUCT_FRAGMENT}
`;
