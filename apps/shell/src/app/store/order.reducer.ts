import { createReducer, on } from '@ngrx/store';

import { Order } from '@mosaic/common';

import * as OrderActions from './order.actions';

export const initialState = {} as Order;

export const orderReducer = createReducer(
  initialState,
  on(OrderActions.setActiveOrder, (state, { order }) => order)
);
