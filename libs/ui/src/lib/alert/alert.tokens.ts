import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MosPopover } from '@mosaic/cdk';

import { MosAlertOptions } from './alert.types';
import { MosAlertComponent } from './components';

export const MOS_ALERTS = new InjectionToken('MOSAIC Alerts', {
  factory: () =>
    new BehaviorSubject<ReadonlyArray<MosPopover<MosAlertComponent, unknown>>>(
      []
    ),
});

export const MOS_ALERT_DEFAULT_OPTIONS: Omit<
  MosAlertOptions,
  'icon' | 'status'
> = {
  autoClose: 3000,
  label: '',
  closeable: true,
  data: undefined,
};

export const MOS_ALERT_OPTIONS = new InjectionToken<MosAlertOptions>(
  'MOSAIC Alert Optons',
  {
    factory: () => ({
      ...MOS_ALERT_DEFAULT_OPTIONS,
    }),
  }
);
