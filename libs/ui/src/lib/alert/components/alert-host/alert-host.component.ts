import {
  ChangeDetectionStrategy,
  Component,
  inject,
  INJECTOR,
  Injector,
} from '@angular/core';

import { MOSAIC_CONTEXT, MosPopover } from '@mosaic/cdk';

import { MOS_ALERTS } from '../../alert.tokens';
import { MosAlertComponent } from '../alert/alert.component';

@Component({
  selector: 'mos-alert-host',
  templateUrl: './alert-host.component.html',
  styleUrls: ['./alert-host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosAlertHostComponent {
  private injector = inject(INJECTOR);

  protected readonly alerts$ = inject(MOS_ALERTS);

  protected createContext(
    useValue: MosPopover<MosAlertComponent, unknown>
  ): Injector {
    return Injector.create({
      providers: [
        {
          provide: MOSAIC_CONTEXT,
          useValue,
        },
      ],
      parent: this.injector,
    });
  }
}
