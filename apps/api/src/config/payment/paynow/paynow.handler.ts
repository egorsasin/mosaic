import { Order } from '@mosaic/core';
import { PaymentMethodHandler } from '@mosaic/core/config';
import {
  CreatePaymentResult,
  SettlePaymentResult,
} from '@mosaic/core/config/payment/payment-method-handler';

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

  createPayment(
    ctx,
    order: Order,
    amount,
    args,
    metadata
  ): CreatePaymentResult {
    return {
      amount,
      state: 'Created' as const,
      metadata,
      transactionId: metadata.paymentId as string,
    };
  },

  settlePayment(): SettlePaymentResult {
    return {
      success: true,
    };
  },
});
