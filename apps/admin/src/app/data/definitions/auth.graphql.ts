import { gql } from 'apollo-angular';

export const CURRENT_USER_FRAGMENT = gql`
  fragment CurrentUser on CurrentUser {
    id
  }
`;

export const ERROR_RESULT_FRAGMENT = gql`
  fragment ErrorResult on ErrorResult {
    errorCode
    message
  }
`;

export const ATTEMPT_LOGIN = gql`
  mutation AttemptLogin($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ...CurrentUser
      ...ErrorResult
    }
  }
  ${CURRENT_USER_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      ...CurrentUser
    }
  }
  ${CURRENT_USER_FRAGMENT}
`;
