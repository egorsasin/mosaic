import { InjectionToken } from '@angular/core';

import { PaymentHandler } from './types';

export const PAYMENT_HANDLER = new InjectionToken<PaymentHandler>(
  'Payment Method Handler'
);
