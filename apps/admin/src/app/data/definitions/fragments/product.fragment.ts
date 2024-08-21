import { gql } from 'apollo-angular';

import { ASSET_FRAGMENT } from './asset.fragment';

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

export const PRODUCT_LIST_QUERY_PRODUCT_FRAGMENT = gql`
  fragment ProductListQueryProductFragment on Product {
    id
    name
    slug
  }
`;
