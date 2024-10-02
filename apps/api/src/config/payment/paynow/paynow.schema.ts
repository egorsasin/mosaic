import { gql } from 'graphql-tag';

export const shopExtensions = gql`
  input PaynowPaymentIntentInput {
    orderId: Int!
  }
  input PaynowPaymentUpdateInput {
    transactionId: String!
  }
  type PaynowPaymentIntent {
    url: String!
    paymentId: String!
  }
  type PaynowPaymentResponse {
    orderCode: String!
  }

  extend type Mutation {
    createPaynowIntent(
      input: PaynowPaymentIntentInput!
    ): PaynowPaymentIntentResult!
    updatePynowPaymentStatus(
      input: PaynowPaymentUpdateInput!
    ): PaynowPaymentStateResult!
  }
  union PaynowPaymentIntentResult = PaynowPaymentIntent | NoActiveOrderError
  union PaynowPaymentStateResult = PaynowPaymentResponse | NoActiveOrderError
`;
