import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ContextWrapper } from '@mosaic/cdk/common';
import { AbstractMosPopoverService } from '@mosaic/cdk/abstract';

import { MosDialogComponent } from './dialog.component';
import { MOS_DIALOG_OPTIONS, MosDialogDefaultOptions } from './dialog.tokens';
import { MOS_DIALOGS, MosPopover } from '@mosaic/cdk';

const DIALOG = new ContextWrapper(MosDialogComponent);

@Injectable({
  providedIn: `root`,
})
export class MosDialogService extends AbstractMosPopoverService<any> {
  protected readonly component = DIALOG;

  constructor(
    @Inject(MOS_DIALOGS)
    dialogs: BehaviorSubject<
      ReadonlyArray<MosPopover<MosDialogComponent, unknown>>
    >,

    @Inject(MOS_DIALOG_OPTIONS) options: any
  ) {
    super(dialogs, options);
  }
}
