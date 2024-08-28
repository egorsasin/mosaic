import { gql } from 'apollo-angular';

export const ASSET_FRAGMENT = gql`
  fragment Asset on Asset {
    id
    source
    preview
  }
`;
