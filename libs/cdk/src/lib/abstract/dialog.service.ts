import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MosPopover } from '../types';
import { ContextWrapper } from '../common';

@Injectable()
export abstract class AbstractMosPopoverService<T, K = void> extends Observable<
  ReadonlyArray<MosPopover<T, unknown>>
> {
  protected abstract readonly component: ContextWrapper<T>;

  protected abstract readonly defaultOptions: T;

  constructor(
    protected items$: BehaviorSubject<ReadonlyArray<MosPopover<T, unknown>>>
  ) {
    super((observer) => this.items$.subscribe(observer));
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

      const item: MosPopover<T, K extends void ? G : K> = {
        ...this.defaultOptions,
        ...options,
        content,
        completeWith,
        $implicit: observer,
        component: this.component,
        createdAt: Date.now(),
      };

      this.add(item as MosPopover<T, unknown>);

      return () => {
        this.remove(item as MosPopover<T, unknown>);
      };
    });
  }

  protected add(dialog: MosPopover<T, unknown>): void {
    this.items$.next([...this.items$.value, dialog]);
  }

  protected remove(element: MosPopover<T, unknown>): void {
    this.items$.next(this.items$.value.filter((item) => item !== element));
  }
}
