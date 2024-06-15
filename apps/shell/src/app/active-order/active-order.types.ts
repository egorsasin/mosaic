import { Order } from '@mosaic/common';

export namespace GetActiveOrder {
  export type Query = {
    activeOrder: Order;
  };
}
