import { Directive } from '@angular/core';

import { MosAbstractControl } from './abstract-control';

@Directive()
export abstract class MosAbstractNullableControl<
  T
> extends MosAbstractControl<T | null> {
  protected getFallbackValue(): T | null {
    return null;
  }
}
