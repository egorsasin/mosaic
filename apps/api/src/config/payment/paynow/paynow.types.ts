import { ErrorCode, ErrorResult } from '@mosaic/common';
import { PaymentState } from '@mosaic/core/types';

export enum PaynowPaymentStatus {
  CONFIRMED = 'CONFIRMED',
  ABANDONED = 'ABANDONED',
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR',
  EXPIRED = 'EXPIRED',
  NEW = 'NEW',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  WAITING_FOR_CONFIRMATION = 'WAITING_FOR_CONFIRMATION',
}

export const paynowPaymentStateMap: {
  [key in PaynowPaymentStatus]: PaymentState;
} = {
  [PaynowPaymentStatus.NEW]: 'Created',
  [PaynowPaymentStatus.PENDING]: 'Authorized',
  [PaynowPaymentStatus.ERROR]: 'Error',
  [PaynowPaymentStatus.CONFIRMED]: 'Settled',
  [PaynowPaymentStatus.REJECTED]: 'Declined',
  [PaynowPaymentStatus.ABANDONED]: 'Created',
  [PaynowPaymentStatus.CANCELLED]: 'Cancelled',
  [PaynowPaymentStatus.EXPIRED]: 'Cancelled',
  [PaynowPaymentStatus.WAITING_FOR_CONFIRMATION]: 'Authorized',
};

export type PaynowPaymentIntent = {
  url: string;
};

export type PaynowPaymentIntentResponse = {
  redirectUrl: string;
  paymentId: string;
  status: PaynowPaymentStatus;
};

export type PaynowPaymentError = ErrorResult & {
  __typename?: 'PaynowPaymentError';
  errorCode: ErrorCode;
  message: string;
};
