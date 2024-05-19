import { PaymentState } from '../../types';
import { PaymentProcess, PaymentTransitionData } from '../../service/helpers';

declare module '../../types/payment-state' {
  interface PaymentStates {
    Authorized: never;
    Settled: never;
    Declined: never;
  }
}

let orderService: import('../../service/services/order.service').OrderService;

/**
 * @description
 * The default {@link PaymentProcess}
 *
 * @docsCategory payment
 */
export const defaultPaymentProcess: PaymentProcess<PaymentState> = {
  transitions: {
    Created: {
      to: ['Authorized', 'Settled', 'Declined', 'Error', 'Cancelled'],
    },
    Authorized: {
      to: ['Settled', 'Error', 'Cancelled'],
    },
    Settled: {
      to: ['Cancelled'],
    },
    Declined: {
      to: ['Cancelled'],
    },
    Error: {
      to: ['Cancelled'],
    },
    Cancelled: {
      to: [],
    },
  },

  async init(injector) {
    // Lazily import these services to avoid a circular dependency error
    // due to this being used as part of the DefaultConfig
    const OrderService = await import(
      '../../service/services/order.service'
    ).then((m) => m.OrderService);

    orderService = injector.get(OrderService);
  },

  async onTransitionEnd(fromState, toState, data: PaymentTransitionData) {
    const { ctx, order } = data;
    // Получим все платежи по текущему заказу
    order.payments = await orderService.getOrderPayments(order.id);

    // TODO For development purposes
    return;

    await orderService.transitionToState(ctx, order.id, 'PaymentSettled');
  },
};
