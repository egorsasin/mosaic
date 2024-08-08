import { createAction } from '@ngrx/store';

export const showSidebarCart = createAction('[Cart] Show Cart');

export const addToCartNotification = createAction(
  '[Cart] Show Add Product Notification'
);
