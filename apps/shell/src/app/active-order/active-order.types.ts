import { Order } from '../types';

export namespace GetActiveOrder {
  export type Query = {
    activeOrder: Order;
  };
}
