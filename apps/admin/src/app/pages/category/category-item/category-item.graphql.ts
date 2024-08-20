import { gql } from 'apollo-angular';

import { ASSET_FRAGMENT } from '../../../schema';

export const PRODUCT_DETAIL_FRAGMENT = gql`
  fragment ProductDetail on Product {
    id
    createdAt
    updatedAt
    enabled
    name
    slug
    description
    featuredAsset {
      ...Asset
    }
    assets {
      ...Asset
    }
  }
  ${ASSET_FRAGMENT}
`;

export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($id: ID!) {
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
