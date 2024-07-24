import { gql } from 'apollo-angular';

import { CART_FRAGMENT } from '../common/definitions';

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
