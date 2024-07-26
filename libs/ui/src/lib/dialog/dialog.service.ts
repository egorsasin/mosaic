import { inject, Injectable } from '@angular/core';

import { ContextWrapper } from '@mosaic/cdk/common';
import { AbstractMosPopoverService } from '@mosaic/cdk/abstract';
import { BehaviorSubject } from 'rxjs';

import { MosDialogComponent } from './dialog.component';
import { MosDialogOptions } from './dialog.types';
import { MOS_DIALOG_OPTIONS } from './dialog.tokens';
import { MosPopover } from '@mosaic/cdk';

const DIALOG = new ContextWrapper(MosDialogComponent);

@Injectable({
  providedIn: `root`,
})
export class MosDialogService extends AbstractMosPopoverService<MosDialogComponent> {
  protected readonly component = DIALOG;
  // protected readonly defaultOptions = {};
  //   ...inject(MOS_DIALOG_OPTIONS),
  //   data: undefined,
  // };

  constructor() {
    super(
      new BehaviorSubject<
        ReadonlyArray<MosPopover<MosDialogComponent, unknown>>
      >([])
    );
  }
}
