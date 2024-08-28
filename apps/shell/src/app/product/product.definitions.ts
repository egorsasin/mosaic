import { gql } from 'apollo-angular';

export const ASSET_FRAGMENT = gql`
  fragment Asset on Asset {
    id
    source
    preview
  }
`;

export const GET_PRODUCT_LIST = gql`
  query GetProductList($input: SearchInput!) {
    search(input: $input) {
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
