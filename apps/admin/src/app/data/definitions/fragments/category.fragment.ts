import { gql } from 'apollo-angular';

import { ASSET_FRAGMENT } from './asset.fragment';

export const CATEGORY_FOR_LIST_FRAGMENT = gql`
  fragment CategoryForList on Category {
    id
    createdAt
    updatedAt
    name
    slug
    position
    isPrivate
    breadcrumbs {
      id
      name
      slug
    }
  }
  ${ASSET_FRAGMENT}
`;
