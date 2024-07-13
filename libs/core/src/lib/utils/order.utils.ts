import { Order, Payment } from '../data';
import { PaymentState } from '../types';

/**
 * Returns true if the Order total is covered by Payments in the specified state.
 */
export function orderTotalIsCovered(
  order: Order,
  state: PaymentState | PaymentState[]
): boolean {
  const paymentsTotal = totalCoveredByPayments(order, state);
  return paymentsTotal >= order.total;
}

/**
 * Returns the total amount covered by all Payments (minus any refunds)
 */
export function totalCoveredByPayments(
  order: Order,
  state?: PaymentState | PaymentState[]
): number {
  const states = ['Error', 'Declined', 'Cancelled'];
  const payments = state
    ? Array.isArray(state)
      ? order.payments.filter((p) => state.includes(p.state))
      : order.payments.filter((p) => p.state === state)
    : order.payments.filter(({ state }) => !states.includes(state));

  return payments.reduce((total: number, payment: Payment) => {
    return total + payment.amount;
  }, 0);
}
