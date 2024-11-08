import { gql } from 'apollo-angular';
import { ERROR_RESULT_FRAGMENT } from '../../../data';

export const PAYNOW_PAYMENT_INTENT_FRAGMENT = gql`
  fragment PaynowPaymentIntent on PaynowPaymentIntent {
    url
    paymentId
  }
`;

export const CREATE_PAYNOW_PAYMENT_INTENT = gql`
  mutation CreatePaynowIntent($input: PaynowPaymentIntentInput!) {
    createPaynowIntent(input: $input) {
      ...PaynowPaymentIntent
      ...ErrorResult
    }
  }
  ${PAYNOW_PAYMENT_INTENT_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;
