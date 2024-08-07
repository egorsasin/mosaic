import { gql } from 'apollo-angular';

export const ORDER_ADDRESS_FRAGMENT = gql`
  fragment OrderAddress on OrderAddress {
    firstName
    lastName
    company
    streetLine
    city
    postalCode
    phoneNumber
  }
`;
