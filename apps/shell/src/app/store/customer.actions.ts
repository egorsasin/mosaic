import { createAction, props } from '@ngrx/store';

import { Customer } from '../types';

export const loadActiveCustomer = createAction(
  '[Customer] Load Active Customer'
);

export const setActiveCustomer = createAction(
  '[Customer] Set Active Customer',
  props<{ customer: Customer }>()
);
