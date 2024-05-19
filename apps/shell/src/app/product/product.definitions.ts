import { gql } from 'apollo-angular';

import { CART_FRAGMENT, ERROR_RESULT_FRAGMENT } from '../common/definitions';

export const ASSET_FRAGMENT = gql`
  fragment Asset on Asset {
    id
    source
    preview
  }
`;

export const GET_PRODUCT_LIST = gql`
  query GetProductList($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        createdAt
        updatedAt
        enabled
        name
        slug
        price
        featuredAsset {
          ...Asset
        }
      }
      totalItems
    }
  }
  ${ASSET_FRAGMENT}
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: Int!, $quantity: Int!) {
    addItemToOrder(productId: $productId, quantity: $quantity) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;
