import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  Optional,
} from '@angular/core';

import { ShippingMethodAbstract, ShippingMethodComponent } from '../shipping';
import { InpostService } from './inpost.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'mos-inpost',
  templateUrl: './inpost.component.html',
  styleUrls: ['./inpost.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosInpostComponent
  extends ShippingMethodAbstract<MosInpostComponent>
  implements OnDestroy
{
  protected destroy$: Subject<void> = new Subject<void>();

  public readonly point = null;

  constructor(@Optional() private host: ShippingMethodComponent<any>) {
    super();

    const inpostService = inject(InpostService);
    this.metadata$.pipe(takeUntil(this.destroy$)).subscribe((metadata) => {
      inpostService.metadata = metadata as Record<string, unknown>;
    });
  }

  public selectPoint(): void {
    this.host?.selectShippingMethod(false);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
