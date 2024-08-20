import { TypedDocumentNode, gql } from 'apollo-angular';

import { ASSET_FRAGMENT } from '../../data';

export const PRODUCT_DETAIL_FRAGMENT = gql`
  fragment ProductDetail on Product {
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
    description
    assets {
      ...Asset
    }
  }
  ${ASSET_FRAGMENT}
`;

export const GET_PRODUCT_DETAIL: TypedDocumentNode = gql`
  query GetProductDetail($id: Int!) {
    product(id: $id) {
      ...ProductDetail
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
`;
