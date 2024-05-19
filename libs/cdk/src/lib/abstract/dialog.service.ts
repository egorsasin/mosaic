import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MosDialog } from '../types';
import { ContextWrapper } from '../common';
import { MosDialogHostService } from '../components';

@Injectable()
export abstract class AbstractMosDialogService<T, K = void> extends Observable<
  ReadonlyArray<MosDialog<T, any>>
> {
  protected abstract readonly component: ContextWrapper<unknown>;

  protected abstract readonly defaultOptions: T;

  protected readonly dialogs$ = new BehaviorSubject<
    ReadonlyArray<MosDialog<T, unknown>>
  >([]);

  private dialogHostService: MosDialogHostService<any, any>;

  constructor() {
    super((observer) => this.dialogs$.subscribe(observer));
    this.dialogHostService = inject(MosDialogHostService);
  }

  public open<G = void>(
    content: ContextWrapper<T>,
    options: Partial<T> = {}
  ): Observable<K extends void ? G : K> {
    return new Observable((observer) => {
      const completeWith = (result: K extends void ? G : K): void => {
        observer.next(result);
        observer.complete();
      };

      const item: any = {
        ...this.defaultOptions,
        ...options,
        content,
        completeWith,
        $implicit: observer,
        component: this.component,
        createdAt: Date.now(),
      };

      this.dialogHostService.add(item);

      return () => {
        this.dialogHostService.remove(item);
      };
    });
  }
}
