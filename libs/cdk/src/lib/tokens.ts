import { InjectionToken, Provider, Type } from '@angular/core';
import { Observable } from 'rxjs';

import { MosAriaDialogContext } from './types';

/**
 * A stream of dialogs
 */
export const MOSAIC_DIALOGS = new InjectionToken<
  ReadonlyArray<Observable<readonly MosAriaDialogContext[]>>
>(`[MOSAIC_DIALOGS]`, {
  factory: () => [],
});

export function mosaicAsDialog(
  useExisting: Type<Observable<readonly MosAriaDialogContext[]>>
): Provider {
  console.log('useExisting', useExisting);
  return {
    provide: MOSAIC_DIALOGS,
    multi: true,
    useExisting,
  };
}
