import { Observer } from 'rxjs';

import { ContextWrapper } from './common';

export interface MosContextWithImplicit<T> {
  $implicit: T;
}

export interface MosAriaDialogContext {
  readonly component: ContextWrapper<unknown>;
  readonly id?: string;
  readonly createdAt: number;
}

export interface MosBaseDialogContext<T>
  extends MosContextWithImplicit<Observer<T>>,
    MosAriaDialogContext {
  readonly completeWith: (value: T) => void;
}

export type MosDialog<T, V> = T & MosBaseDialogContext<V>;
