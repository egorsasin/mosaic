export enum PaynowPaymentIntentStatus {
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

export type PaynowPaymentIntent = {
  url: string;
};

export type PaynowPaymentIntentResponse = {
  redirectUrl: string;
  paymentId: string;
  status: PaynowPaymentIntentStatus;
};
