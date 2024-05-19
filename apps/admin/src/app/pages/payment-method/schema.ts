import { TypedDocumentNode, gql } from 'apollo-angular';

export const GET_PAYMENT_METHOD_LIST = gql`
  query GetPaymentMethodList($options: PaymentMethodListOptions!) {
    paymentMethods(options: $options) {
      items {
        ...PaymentMethodListItem
      }
      totalItems
    }
  }

  fragment PaymentMethodListItem on PaymentMethod {
    id
    createdAt
    updatedAt
    name
    description
    code
    enabled
  }
`;

export const CONFIGURABLE_OPERATION_FRAGMENT = gql`
  fragment ConfigurableOperation on ConfigurableOperation {
    args {
      name
      value
    }
    code
  }
`;

export const PAYMENT_METHOD_FRAGMENT = gql`
  fragment PaymentMethod on PaymentMethod {
    id
    createdAt
    updatedAt
    name
    code
    description
    enabled
    handler {
      ...ConfigurableOperation
    }
  }

  ${CONFIGURABLE_OPERATION_FRAGMENT}
`;

export const GET_PAYMENT_METHOD_DETAIL: TypedDocumentNode = gql`
  query GetPaymentMethodDetail($id: Int!) {
    paymentMethod(id: $id) {
      ...PaymentMethod
    }
  }

  ${PAYMENT_METHOD_FRAGMENT}
`;

export const CONFIGURABLE_OPERATION_DEF_FRAGMENT = gql`
  fragment ConfigurableOperationDef on ConfigurableOperationDefinition {
    args {
      name
      type
      required
      defaultValue
      list
      ui
      label
      description
    }
    code
    description
  }
`;

export const GET_PAYMENT_METHOD_OPERATIONS = gql`
  query GetPaymentMethodOperations {
    paymentMethodHandlers {
      ...ConfigurableOperationDef
    }
  }
  ${CONFIGURABLE_OPERATION_DEF_FRAGMENT}
`;

export const CREATE_PAYMENT_METHOD = gql`
  mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) {
    createPaymentMethod(input: $input) {
      ...PaymentMethod
    }
  }
  ${PAYMENT_METHOD_FRAGMENT}
`;
