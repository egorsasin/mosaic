import { gql } from 'apollo-angular';

export const ADMINISTRATOR_FRAGMENT = gql`
  fragment Administrator on Administrator {
    id
    createdAt
    emailAddress
    user {
      id
      identifier
      lastLogin
    }
  }
`;

export const GET_ACTIVE_ADMINISTRATOR = gql`
  query GetActiveAdministrator {
    activeAdministrator {
      ...Administrator
    }
  }
  ${ADMINISTRATOR_FRAGMENT}
`;
