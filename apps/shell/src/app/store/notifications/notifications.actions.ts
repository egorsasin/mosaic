import { createAction, props } from '@ngrx/store';

import { ContextWrapper } from '@mosaic/cdk';
import { MosAlertOptions } from '@mosaic/ui/alert/alert.types';

export const showNotification = createAction(
  '[Notifications] Show notification',
  props<{
    message: ContextWrapper<MosAlertOptions<undefined>> | string;
    options?: MosAlertOptions<undefined> | undefined;
  }>()
);
