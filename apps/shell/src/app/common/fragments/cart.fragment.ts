import { gql } from 'apollo-angular';

export const CART_FRAGMENT = gql`
  fragment Cart on Order {
    id
    code
    state
    lines {
      id
      quantity
      proratedLinePrice
      product {
        id
        name
        price
        featuredAsset {
          source
          preview
        }
      }
    }
    shippingLine {
      price
      metadata
      shippingMethod {
        id
        code
        name
      }
    }
    totalQuantity
    subTotal
    shipping
    total
  }
`;
