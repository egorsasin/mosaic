import { gql } from 'apollo-angular';

import { ASSET_FRAGMENT } from '../product.definitions';

export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($slug: String!) {
    product(slug: $slug) {
      id
      name
      price
      description
      featuredAsset {
        ...Asset
      }
    }
  }
  ${ASSET_FRAGMENT}
`;
