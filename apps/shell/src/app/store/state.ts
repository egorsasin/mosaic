import { Customer, Order } from '../types';

export interface AppState {
  state: {
    activeOrder?: Order;
    activeCustomer?: Customer;
  };
}
