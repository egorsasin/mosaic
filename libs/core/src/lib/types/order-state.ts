import { RequestContext } from '../api/common';
import { Order } from '../data';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OrderStates {}

export type OrderState = 'Created' | 'Cancelled' | keyof OrderStates;

export interface OrderTransitionData {
  ctx: RequestContext;
  order: Order;
}
