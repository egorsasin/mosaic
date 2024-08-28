import { gql } from 'apollo-angular';

import { ASSET_FRAGMENT } from '../../../data';

export const GET_PRODUCT_VARIANTS_FOR_MULTI_SELECTOR = gql`
  query GetProductVariantsForMultiSelector($options: ProductListOptions!) {
    products(options: $options) {
      items {
        id
        createdAt
        updatedAt
        enabled
        name
        price
        sku
        featuredAsset {
          ...Asset
        }
      }
      totalItems
    }
  }
  ${ASSET_FRAGMENT}
`;
