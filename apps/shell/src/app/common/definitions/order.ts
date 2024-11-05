import { gql } from 'apollo-angular';
import { CART_FRAGMENT, ORDER_ADDRESS_FRAGMENT } from '../../data';

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

      ... on Order {
        shippingAddress {
          ...OrderAddress
        }
        payments {
          method
        }
        customer {
          id
          firstName
          lastName
          emailAddress
        }
      }
    }
  }
  ${CART_FRAGMENT}
  ${ORDER_ADDRESS_FRAGMENT}
`;
