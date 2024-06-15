import { createAction, props } from '@ngrx/store';

import { Order } from '@mosaic/common';

export const setActiveOrder = createAction(
  '[Order] Set Active Order',
  props<{ order: Order }>()
);
