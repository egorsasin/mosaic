import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import * as CheckoutActions from './checkout.actions';
import { CheckoutService } from '../checkout.service';

export const refetchShippingMethods = createEffect(
  (actions$ = inject(Actions), checkoutService = inject(CheckoutService)) => {
    return actions$.pipe(
      ofType(CheckoutActions.refetchShippingMethods),
      tap(() => checkoutService.refetchShippingMethods())
    );
  },
  { functional: true, dispatch: false }
);
