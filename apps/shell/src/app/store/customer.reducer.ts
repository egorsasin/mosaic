import { createReducer, on } from '@ngrx/store';

import { Customer } from '../types';

import * as CustomerActions from './customer.actions';

export const initialState = {} as Customer;

export const customerReducer = createReducer(
  initialState,
  on(CustomerActions.setActiveCustomer, (state, { customer }) => customer)
);
