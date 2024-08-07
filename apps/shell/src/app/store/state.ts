import { Order } from '@mosaic/common';

import { Customer } from '../types';

export interface AppState {
  state: {
    activeOrder: Order | null;
    activeCustomer?: Customer;
  };
}
