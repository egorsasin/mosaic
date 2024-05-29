import { gql } from 'apollo-angular';
import { CART_FRAGMENT, ERROR_RESULT_FRAGMENT } from '../../common/definitions';

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
