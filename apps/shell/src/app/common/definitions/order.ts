import { gql } from 'apollo-angular';

import { CART_FRAGMENT } from '../fragments';

export const GET_ACTIVE_ORDER = gql`
  query GetActiveOrder {
    activeOrder {
      customer {
        id
        firstName
        lastName
        emailAddress
      }
      shippingAddress {
        firstName
        lastName
        phoneNumber
        city
        postalCode
        streetLine
      }
      ...Cart
    }
  }
  ${CART_FRAGMENT}
`;

export const GET_ORDER_BY_CODE = gql`
  query GetOrderByCode($code: String!) {
    orderByCode(code: $code) {
      ...Cart
      updatedAt
      customer {
        id
        firstName
        lastName
        user {
          id
          identifier
          verified
        }
      }
    }
  }
  ${CART_FRAGMENT}
`;
