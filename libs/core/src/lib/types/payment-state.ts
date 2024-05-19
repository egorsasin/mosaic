// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PaymentStates {}

export type PaymentState =
  | 'Created'
  | 'Error'
  | 'Cancelled'
  | keyof PaymentStates;
