import { PaymentMethodHandler } from '@mosaic/core/config';
import { CreatePaymentResult } from '@mosaic/core/config/payment/payment-method-handler';

const gripeSDK = {
  charges: {
    create: (options: unknown) => {
      return Promise.resolve({
        id: Math.random().toString(36).substr(3),
      });
    },
    capture: async (transactionId: string) => {
      return true;
    },
  },
};

export const examplePaymentHandler = new PaymentMethodHandler({
  code: 'example-payment-provider',
  description: 'Example Payment Provider',
  args: {
    automaticCapture: { type: 'boolean', required: false },
    apiKey: { type: 'string', required: false },
  },

  // Функция создает платеж в текущей платежной системе
  createPayment: async (
    ctx,
    order,
    amount,
    args,
    metadata
  ): Promise<CreatePaymentResult> => {
    try {
      const result = await gripeSDK.charges.create({
        apiKey: args.apiKey,
        amount,
        source: metadata.authToken,
      });

      return {
        amount,
        state: args.automaticCapture ? 'Settled' : 'Authorized',
        transactionId: result.id.toString(),
        metadata,
      };
    } catch (err) {
      return {
        amount,
        state: 'Declined' as const,
        metadata: {
          errorMessage: err.message,
        },
      };
    }
  },

  settlePayment: async (ctx, order, payment, args, method) => {
    const result = await gripeSDK.charges.capture(payment.transactionId);
    return {
      success: result,
      metadata: {
        captureId: '1234567',
      },
    };
  },
});
