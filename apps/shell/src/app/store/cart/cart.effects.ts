import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap } from 'rxjs';

import { MosDialogService } from '@mosaic/ui/dialog';
import { ContextWrapper } from '@mosaic/cdk';

import * as CartActions from './cart.actions';
import { SidebarService } from '../../shared/sidebar';
import {
  AddToCardNotificationComponent,
  CartSidebarComponent,
} from '../../shared';

export const showSidebarCart = createEffect(
  (actions$ = inject(Actions), sidebarService = inject(SidebarService)) => {
    return actions$.pipe(
      ofType(CartActions.showSidebarCart),
      exhaustMap(() => sidebarService.sidebar(CartSidebarComponent))
    );
  },
  { functional: true, dispatch: false }
);

export const showAddToCartNotification = createEffect(
  (actions$ = inject(Actions), dialog = inject(MosDialogService)) => {
    return actions$.pipe(
      ofType(CartActions.addToCartNotification),
      exhaustMap(() =>
        dialog.open(new ContextWrapper(AddToCardNotificationComponent), {
          appearance: 'mos-success-top',
        } as any)
      )
    );
  },
  { functional: true, dispatch: false }
);
