import { HistoryEntryType } from '@mosaic/common';

import { PaymentState } from '../../types';
import { PaymentProcess, PaymentTransitionData } from '../../service';
import { orderTotalIsCovered } from '../../utils';

declare module '../../types/payment-state' {
  interface PaymentStates {
    Authorized: never;
    Settled: never;
    Declined: never;
  }
}

let orderService: import('../../service/services/order.service').OrderService;
let historyService: import('../../service/services/history.service').HistoryService;

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
      to: ['Cancelled', 'Settled'],
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
    const HistoryService = await import(
      '../../service/services/history.service'
    ).then((m) => m.HistoryService);

    orderService = injector.get(OrderService);
    historyService = injector.get(HistoryService);
  },

  async onTransitionEnd(fromState, toState, data: PaymentTransitionData) {
    const { ctx, order } = data;
    // Получим все платежи по текущему заказу
    order.payments = await orderService.getOrderPayments(order.id);

    await historyService.createHistoryEntryForOrder({
      ctx: data.ctx,
      orderId: data.order.id,
      type: HistoryEntryType.ORDER_PAYMENT_TRANSITION,
      data: {
        paymentId: data.payment.id,
        from: fromState,
        to: toState,
      },
    });

    if (
      orderTotalIsCovered(order, 'Settled') &&
      order.state !== 'PaymentSettled'
    ) {
      await orderService.transitionToState(ctx, order.id, 'PaymentSettled');
    } else if (
      orderTotalIsCovered(order, ['Settled', 'Authorized']) &&
      order.state !== 'PaymentAuthorized'
    ) {
      await orderService.transitionToState(ctx, order.id, 'PaymentAuthorized');
    } else {
      // Изменим статус ордера после размещения платежа
      await orderService.transitionToState(ctx, order.id, 'ArrangingPayment');
    }
  },
};
