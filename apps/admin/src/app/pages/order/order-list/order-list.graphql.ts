import { gql } from 'apollo-angular';

const ORDER_FRAGMENT = gql`
  fragment Order on Order {
    id
    name
    slug
  }
`;

export const ORDER_LIST_QUERY = gql`
  query OrderListQuery($options: ListOptions) {
    orders(options: $options) {
      items {
        ...Order
      }
      totalItems
    }
  }
  ${ORDER_FRAGMENT}
`;
