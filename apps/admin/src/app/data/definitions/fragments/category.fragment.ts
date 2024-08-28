import { gql } from 'apollo-angular';

import { CONFIGURABLE_OPERATION_FRAGMENT } from '../payment-method.graphql';

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

export const CATEGORY_FRAGMENT = gql`
  fragment Category on Category {
    id
    createdAt
    updatedAt
    name
    slug
    description
    isPrivate
    filters {
      ...ConfigurableOperation
    }
  }
  ${CONFIGURABLE_OPERATION_FRAGMENT}
`;
