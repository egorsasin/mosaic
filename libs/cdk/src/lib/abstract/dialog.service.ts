import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MosPopover } from '../types';
import { ContextWrapper } from '../common';

@Injectable()
export abstract class AbstractMosPopoverService<S, K = void> extends Observable<
  ReadonlyArray<MosPopover<S, unknown>>
> {
  protected abstract readonly component: any; //ContextWrapper<T>;

  // protected abstract readonly defaultOptions: T;

  constructor(
    protected items$: BehaviorSubject<ReadonlyArray<MosPopover<S, unknown>>>,
    protected defaultOptions: S = {} as S
  ) {
    super((observer) => this.items$.subscribe(observer));
  }

  public open<G = void>(
    content: ContextWrapper<S> | string,
    options: Partial<S> = {}
  ): Observable<K extends void ? G : K> {
    return new Observable((observer) => {
      const completeWith = (result: K extends void ? G : K): void => {
        observer.next(result);
        observer.complete();
      };

      const item: MosPopover<S, K extends void ? G : K> = {
        ...this.defaultOptions,
        ...options,
        content,
        completeWith,
        $implicit: observer,
        component: this.component,
        createdAt: Date.now(),
      };

      this.add(item as MosPopover<S, unknown>);

      return () => {
        this.remove(item as MosPopover<S, unknown>);
      };
    });
  }

  protected add(item: MosPopover<S, unknown>): void {
    this.items$.next([...this.items$.value, item]);
  }

  protected remove(element: MosPopover<S, unknown>): void {
    this.items$.next(this.items$.value.filter((item) => item !== element));
  }
}
