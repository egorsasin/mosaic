import { AppState } from './state';

export const selectActiveOrder = (state: any) => {
  return state.activeOrder;
};
