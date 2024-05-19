import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap } from 'rxjs';

import * as CartActions from './cart.actions';
import { SidebarService } from '../../shared/sidebar';

import { CartSidebarComponent } from './cart-sidebar.componrnt';

export const showSidebarCart = createEffect(
  (actions$ = inject(Actions), sidebarService = inject(SidebarService)) => {
    return actions$.pipe(
      ofType(CartActions.showSidebarCart),
      exhaustMap(() => sidebarService.sidebar(CartSidebarComponent))
    );
  },
  { functional: true, dispatch: false }
);
