import { gql } from 'apollo-angular';

export const CURRENT_USER_FRAGMENT = gql`
  fragment CurrentUser on CurrentUser {
    id
    identifier
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      ...CurrentUser
    }
  }
  ${CURRENT_USER_FRAGMENT}
`;
