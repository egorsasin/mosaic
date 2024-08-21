import { gql } from 'apollo-angular';

export const CATEGORY_FOR_LIST_FRAGMENT = gql`
  fragment CategoryForList on Category {
    id
    createdAt
    updatedAt
    name
    slug
    isPrivate
  }
`;
