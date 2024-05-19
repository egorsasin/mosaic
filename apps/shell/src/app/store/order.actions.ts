import { createAction, props } from '@ngrx/store';

import { Order } from '../types';

export const setActiveOrder = createAction(
  '[Order] Set Active Order',
  props<{ order: Order }>()
);
