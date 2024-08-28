import { gql } from 'apollo-angular';

import { ASSET_FRAGMENT } from '../../../data';

export const GET_ASSET_LIST = gql`
  query GetAssetList($options: AssetListOptions) {
    assets(options: $options) {
      items {
        ...Asset
      }
      totalItems
    }
  }
  ${ASSET_FRAGMENT}
`;

export const CREATE_ASSETS = gql`
  mutation CreateAssets($input: [CreateAssetInput!]!) {
    createAssets(input: $input) {
      ...Asset
    }
  }
  ${ASSET_FRAGMENT}
`;
