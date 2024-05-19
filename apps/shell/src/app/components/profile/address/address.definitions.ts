import { gql } from 'apollo-angular';

export const ADDRESS_FRAGMENT = gql`
  fragment Address on Address {
    id
    city
    default
  }
`;

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: CreateAddressInput!) {
    createCustomerAddress(input: $input) {
      ...Address
    }
  }
  ${ADDRESS_FRAGMENT}
`;
