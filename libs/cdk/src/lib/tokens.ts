import { InjectionToken, Provider, Type } from '@angular/core';
import { Observable } from 'rxjs';

import { MosAriaPopoverContext } from './types';

/**
 * A stream of dialogs
 */
export const MOSAIC_DIALOGS = new InjectionToken<
  ReadonlyArray<Observable<readonly MosAriaPopoverContext[]>>
>(`[MOSAIC_DIALOGS]`, {
  factory: () => [],
});

export function mosaicAsDialog(
  useExisting: Type<Observable<readonly MosAriaPopoverContext[]>>
): Provider {
  console.log('useExisting', useExisting);
  return {
    provide: MOSAIC_DIALOGS,
    multi: true,
    useExisting,
  };
}
