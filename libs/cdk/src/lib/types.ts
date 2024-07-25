import { Observer } from 'rxjs';

import { ContextWrapper } from './common';

export interface MosContextWithImplicit<T> {
  $implicit: T;
}

export interface MosAriaPopoverContext {
  readonly component: ContextWrapper<unknown>;
  readonly id?: string;
  readonly createdAt: number;
}

export interface MosPopoverContext<T>
  extends MosContextWithImplicit<Observer<T>>,
    MosAriaPopoverContext {
  readonly completeWith: (value: T) => void;
}

export type MosPopover<T, V> = T & MosPopoverContext<V>;
