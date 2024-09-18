import { gql } from 'apollo-angular';

export const USER_STATUS_FRAGMENT = gql`
  fragment UserStatus on UserStatus {
    username
    isLoggedIn
    loginTime
  }
`;

export const GET_USER_STATUS = gql`
  query GetUserState {
    userStatus @client {
      ...UserStatus
    }
  }
  ${USER_STATUS_FRAGMENT}
`;

export const SET_AS_LOGGED_IN = gql`
  mutation SetAsLoggedIn($input: UserStatusInput!) {
    setAsLoggedIn(input: $input) @client {
      ...UserStatus
    }
  }
  ${USER_STATUS_FRAGMENT}
`;

export const SET_AS_LOGGED_OUT = gql`
  mutation SetAsLoggedOut {
    setAsLoggedOut @client {
      ...UserStatus
    }
  }
  ${USER_STATUS_FRAGMENT}
`;
