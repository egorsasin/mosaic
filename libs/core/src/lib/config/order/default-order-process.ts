import { OrderPlacedEvent } from '../../event-bus';
import { OrderState } from '../../types';
import { OrderProcess } from './order-process';

declare module '../../types/order-state' {
  interface OrderStates {
    ArrangingPayment: never;
    PaymentAuthorized: never;
    PaymentSettled: never;
  }
}

export function configureDefaultOrderProcess() {
  let configService: import('../config.service').ConfigService;
  let eventBus: import('../../event-bus/event-bus').EventBus;

  const orderProcess: OrderProcess<OrderState> = {
    transitions: {
      Created: {
        to: [
          'Cancelled',
          'ArrangingPayment',
          'PaymentSettled',
          'PaymentAuthorized',
        ],
      },
      ArrangingPayment: {
        to: ['PaymentAuthorized', 'PaymentSettled', 'Cancelled'],
      },
      PaymentAuthorized: {
        to: ['PaymentSettled', 'Cancelled'],
      },
      PaymentSettled: {
        to: ['Cancelled'],
      },
      Cancelled: {
        to: [],
      },
    },

    async init(injector) {
      const ConfigService = await import('../config.service').then(
        (m) => m.ConfigService
      );
      const EventBus = await import('../../event-bus/event-bus').then(
        (m) => m.EventBus
      );

      configService = injector.get(ConfigService);
      eventBus = injector.get(EventBus);
    },

    async onTransitionEnd(fromState, toState, data) {
      const { ctx, order } = data;
      const { orderPlacedStrategy } = configService.orderOptions;
      const shouldSetAsPlaced = orderPlacedStrategy.shouldSetAsPlaced(
        ctx,
        fromState,
        toState,
        order
      );

      if (shouldSetAsPlaced) {
        order.active = false;
        order.orderPlacedAt = new Date();

        await eventBus.publish(
          new OrderPlacedEvent(fromState, toState, ctx, order)
        );
      }
    },
  };

  return orderProcess;
}

export const defaultOrderProcess = configureDefaultOrderProcess();
