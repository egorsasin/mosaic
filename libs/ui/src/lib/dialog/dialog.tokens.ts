import { InjectionToken } from '@angular/core';

import { MosDialogOptions } from './dialog.types';

export type MosDialogDefaultOptions = Omit<MosDialogOptions<unknown>, 'data'>;

export const MOS_DIALOG_DEFAULT_OPTIONS: MosDialogDefaultOptions = {
  dismissible: true,
};

export const MOS_DIALOG_OPTIONS = new InjectionToken<MosDialogDefaultOptions>(
  `[MOS_DIALOG_OPTIONS]`,
  {
    factory: () => MOS_DIALOG_DEFAULT_OPTIONS,
  }
);
