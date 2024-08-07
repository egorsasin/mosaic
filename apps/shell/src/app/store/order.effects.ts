import { inject } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { map } from 'rxjs/operators';

import { ActiveOrderService } from '../active-order';
import { setActiveOrder } from './order.actions';

export const activeOrder = createEffect(
  (activeOrderService = inject(ActiveOrderService)) => {
    return activeOrderService.activeOrder$.pipe(
      map((order) => {
        return setActiveOrder({ order });
      })
    );
  },
  { functional: true }
);
