import { createReducer, on } from '@ngrx/store';

import { Maybe, Order } from '@mosaic/common';

import * as OrderActions from './order.actions';

export const initialState: Maybe<Order> = null;

export const orderReducer = createReducer<Maybe<Order>>(
  initialState,
  on(OrderActions.setActiveOrder, (state, { order }) => order)
);
