import { gql } from 'apollo-angular';

import {
  CART_FRAGMENT,
  ERROR_RESULT_FRAGMENT,
  ORDER_ADDRESS_FRAGMENT,
} from '../../common/definitions';

export const SET_CUSTOMER_FOR_ORDER = gql`
  mutation SetCustomerForOrder($input: CreateCustomerInput!) {
    setCustomerForOrder(input: $input) {
      ... on Order {
        id
      }
      ...ErrorResult
    }
  }
  ${ERROR_RESULT_FRAGMENT}
`;

export const GET_ELIGIBLE_PAYMENT_METHODS = gql`
  query GetEligiblePaymentMethods {
    eligiblePaymentMethods {
      id
      code
      name
      description
      eligibilityMessage
      isEligible
    }
  }
`;

export const GET_ELIGIBLE_SHIPPING_METHODS = gql`
  query GetEligibleShippingMethods {
    eligibleShippingMethods {
      id
      name
      description
      price
      metadata
    }
  }
`;

export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethod($input: ShippingInput!) {
    setOrderShippingMethod(input: $input) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ...Cart
      ... on Order {
        shippingAddress {
          ...OrderAddress
        }
      }
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ORDER_ADDRESS_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const ADD_PAYMENT = gql`
  mutation AddPayment($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;
