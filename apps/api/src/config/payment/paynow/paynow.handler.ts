import { PaymentMethodHandler } from '@mosaic/core/config';
import { CreatePaymentResult } from '@mosaic/core/config/payment/payment-method-handler';

/**
 * The handler for Paynow payments.
 */
export const paynowPaymentMethodHandler = new PaymentMethodHandler({
  code: 'paynow',

  description: 'Paynow payments',

  args: {
    apiKey: {
      type: 'string',
      label: 'API Key',
      ui: { component: 'text-form-input' },
    },
    signatureKey: {
      type: 'string',
      label: 'Signature key',
      ui: { component: 'text-form-input' },
    },
  },

  createPayment(ctx, order, amount): CreatePaymentResult {
    return {
      amount,
      state: 'Settled' as const,
    };
  },
});
