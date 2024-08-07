import { Inject, inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AbstractMosPopoverService } from '@mosaic/cdk/abstract';
import { ContextWrapper, MosPopover } from '@mosaic/cdk';

import { MOS_ALERT_OPTIONS, MOS_ALERTS } from './alert.tokens';
import { MosAlertOptions } from './alert.types';

import { MosAlertComponent } from './components';

const ALERT = new ContextWrapper(MosAlertComponent);

@Injectable()
export class MosAlertService extends AbstractMosPopoverService<MosAlertOptions> {
  protected component: ContextWrapper<MosAlertComponent> = ALERT;

  // protected readonly defaultOptions: MosAlertOptions<unknown> = {
  //   ...inject(MOS_ALERT_OPTIONS),
  //   data: undefined,
  // };

  constructor(
    @Inject(MOS_ALERTS)
    alerts: BehaviorSubject<
      ReadonlyArray<MosPopover<MosAlertComponent, unknown>>
    >,
    @Inject(MOS_ALERT_OPTIONS)
    options: MosAlertOptions
  ) {
    super(alerts as any, options as any);
  }
}
