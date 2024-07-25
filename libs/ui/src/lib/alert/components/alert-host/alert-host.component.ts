import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MOS_ALERTS } from '../../alert.tokens';

@Component({
  selector: 'mos-alert-host',
  templateUrl: './alert-host.component.html',
  styleUrls: ['./alert-host.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MosAlertHostComponent {
  protected readonly alerts$ = inject(MOS_ALERTS);
}
