import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MosDialog } from '../../types';

@Injectable()
export class MosDialogHostService<T, K = void> extends Observable<
  ReadonlyArray<any>
> {
  private readonly dialogs$ = new BehaviorSubject<
    ReadonlyArray<MosDialog<T, unknown>>
  >([]);

  constructor() {
    super((observer) => this.dialogs$.subscribe(observer));
  }

  public add(dialog: any) {
    this.dialogs$.next([...this.dialogs$.value, dialog]);
  }

  public remove(dialog: any) {
    this.dialogs$.next(this.dialogs$.value.filter((item) => item !== dialog));
  }
}
