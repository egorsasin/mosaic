import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap } from 'rxjs/operators';

import { MosAlertService } from '@mosaic/ui/alert';

import * as NotificationActions from './notifications.actions';

export const show = createEffect(
  (actions$ = inject(Actions), alert = inject(MosAlertService)) => {
    return actions$.pipe(
      ofType(NotificationActions.showNotification),
      mergeMap(({ message, options = {} }) => {
        return alert.open(message, options);
      })
    );
  },
  { functional: true, dispatch: false }
);
