import { inject, Injectable } from '@angular/core';

import { ContextWrapper } from '@mosaic/cdk/common';
import { AbstractMosPopoverService } from '@mosaic/cdk/abstract';

import { MosDialogComponent } from './dialog.component';
import { MosDialogOptions } from './dialog.types';
import { MOS_DIALOG_OPTIONS } from './dialog.tokens';

const DIALOG = new ContextWrapper(MosDialogComponent);

@Injectable({
  providedIn: `root`,
})
export class MosDialogService extends AbstractMosPopoverService<unknown> {
  protected readonly component = DIALOG;
  protected readonly defaultOptions: MosDialogOptions<unknown> = {
    ...inject(MOS_DIALOG_OPTIONS),
    data: undefined,
  };
}
