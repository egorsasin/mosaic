import { gql } from 'apollo-angular';

import { CART_FRAGMENT, ERROR_RESULT_FRAGMENT } from '../fragments';

export const ADJUST_ITEM_QUANTITY = gql`
  mutation AdjustItemQuantity($id: Int!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $id, quantity: $quantity) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const REMOVE_ITEM_FROM_CART = gql`
  mutation RemoveItemFromCart($id: Int!) {
    removeOrderLine(orderLineId: $id) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const GET_ELIGIBLE_SHIPPING_METHODS = gql`
  query GetEligibleShippingMethods {
    eligibleShippingMethods {
      id
      name
      code
      description
      price
      metadata
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: Int!, $quantity: Int!) {
    addItemToOrder(productId: $productId, quantity: $quantity) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;
