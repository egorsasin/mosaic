import { InjectionToken } from '@angular/core';

import { MosDialogOptions } from './dialog.types';

type MosDialogDefaultOptions = Omit<MosDialogOptions<unknown>, 'data'>;

export const MOS_DIALOG_DEFAULT_OPTIONS: MosDialogDefaultOptions = {};

export const MOS_DIALOG_OPTIONS = new InjectionToken<MosDialogDefaultOptions>(
  `[MOS_DIALOG_OPTIONS]`,
  {
    factory: () => MOS_DIALOG_DEFAULT_OPTIONS,
  }
);
