import { Component, HostBinding, inject, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { MOSAIC_CONTEXT } from '@mosaic/cdk';

import { MosDialogCloseService } from './dialog-close.service';
import { MOS_SLIDE_IN_TOP } from './dialog.animation';

@Component({
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  providers: [MosDialogCloseService],
  selector: 'mos-dialog',
  animations: [MOS_SLIDE_IN_TOP],
  host: {
    '[attr.data-appearance]': 'context.appearance',
  },
})
export class MosDialogComponent {
  protected get header(): any {
    return this.context.header;
  }

  @HostBinding('@mosSlideInTop')
  protected atimation = true;

  constructor(@Inject(MOSAIC_CONTEXT) public context: any) {
    inject(MosDialogCloseService)
      .pipe(
        map(() => this.context.dismissible),
        filter(Boolean),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.close();
      });
  }

  private close(): void {
    this.context.$implicit.complete();
  }
}
