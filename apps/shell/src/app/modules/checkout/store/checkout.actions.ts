import { createAction } from '@ngrx/store';

export const refetchShippingMethods = createAction(
  '[Checkout] Refresh shipping methods'
);
