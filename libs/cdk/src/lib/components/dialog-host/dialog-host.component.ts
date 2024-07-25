import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  InjectionToken,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { WINDOW } from '../../common';
import { MosPopover } from '../../types';

import { MOS_PARENT_ANIMATION } from './animation';
import { MosDialogHostService } from './dialog-host.service';

/**
 * Is closing dialog on browser backward navigation enabled
 */
export const MOS_DIALOG_CLOSES_ON_BACK = new InjectionToken<
  Observable<boolean>
>('[`MOS_DIALOG_CLOSES_ON_BACK]', {
  factory: () => of(true),
});

const FAKE_HISTORY_STATE = { label: 'ignoreMe' } as const;
const isFakeHistoryState = (
  historyState: Record<string, unknown> & { label: string }
): historyState is typeof FAKE_HISTORY_STATE =>
  historyState?.label === FAKE_HISTORY_STATE.label;

@Component({
  selector: 'mos-dialog-host',
  templateUrl: './dialog-host.template.html',
  styleUrls: ['./dialog-host.style.scss'],
  // So that we do not force OnPush on custom dialogs
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [MOS_PARENT_ANIMATION],
})
export class MosDialogHostComponent<T extends MosPopover<unknown, unknown>> {
  readonly dialogs$ = this.dialogsByType.pipe(
    map((dialogs) =>
      new Array<T>()
        .concat(...dialogs)
        .sort((a, b) => a.createdAt - b.createdAt)
    )
  );

  private get historyRef(): History {
    return this.window.history;
  }

  constructor(
    @Inject(MOS_DIALOG_CLOSES_ON_BACK)
    readonly isDialogClosesOnBack$: Observable<boolean>,
    @Inject(MosDialogHostService)
    private readonly dialogsByType: Observable<readonly T[]>,
    @Inject(WINDOW) private readonly window: Window,
    @Inject(Title) private readonly titleService: Title
  ) {}

  closeLast(dialogs: readonly T[], isDialogClosesOnBack: boolean): void {
    if (!isDialogClosesOnBack) {
      return;
    }

    const [last] = dialogs.slice(-1);

    if (!last) {
      return;
    }

    if (dialogs.length > 1) {
      this.historyRef.pushState(
        FAKE_HISTORY_STATE,
        this.titleService.getTitle()
      );
    }

    last.$implicit.complete();
  }

  public onDialog(
    { propertyName }: TransitionEvent,
    popupOpened: boolean,
    isDialogClosesOnBack: boolean
  ): void {
    if (!isDialogClosesOnBack || propertyName !== 'letter-spacing') {
      return;
    }

    if (popupOpened) {
      this.historyRef.pushState(
        FAKE_HISTORY_STATE,
        this.titleService.getTitle()
      );
    } else if (isFakeHistoryState(this.historyRef.state)) {
      this.historyRef.back();
    }
  }
}
