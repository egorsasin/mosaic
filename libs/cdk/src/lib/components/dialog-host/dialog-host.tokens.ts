import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const MOS_DIALOGS = new InjectionToken('MOSAIC Dialogs', {
  factory: () => new BehaviorSubject<ReadonlyArray<unknown>>([]),
});
