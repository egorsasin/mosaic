import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MosPopover } from '../../types';
import { MOS_DIALOGS } from './dialog-host.tokens';

@Injectable()
export class MosDialogHostService<T, K = void> extends Observable<
  ReadonlyArray<any>
> {
  constructor(
    @Inject(MOS_DIALOGS)
    dialogs$: BehaviorSubject<ReadonlyArray<MosPopover<unknown, unknown>>>
  ) {
    super((observer) => dialogs$.subscribe(observer));
  }
}
