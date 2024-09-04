import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs';

import { ShippingLine, ShippingMethodQuote } from '@mosaic/common';

import { ShippingMethodService } from './shipping-method.service';
import { SetShippingMethodVariables } from '../data';

@Component({
  selector: 'mos-shipping-method-selector',
  templateUrl: './shipping-method-selector.component.html',
  styles: [
    `
      .payment-metods--active {
        @apply ring-1 ring-slate-700/60 ring-offset-2;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ShippingMethodService],
})
export class ShippingMethodSelectorComponent implements OnDestroy, OnChanges {
  @Input() public shippingMethods: ShippingMethodQuote[] | null = [];

  @Input() public selected?: ShippingLine;

  @Output() public selelectMethod: EventEmitter<SetShippingMethodVariables> =
    new EventEmitter<SetShippingMethodVariables>();

  protected destroy$: Subject<void> = new Subject<void>();

  constructor(private metadataCache: ShippingMethodService) {}

  public ngOnChanges({ selected }: SimpleChanges): void {
    const shippingData = selected?.currentValue;

    if (shippingData && shippingData.metadata) {
      const { shippingMethod, metadata } = shippingData;

      this.metadataCache.setMetadata(shippingMethod.code, metadata);
    }
  }

  public setShippingMethod(
    shippingMethodId: number,
    metadata: Record<string, unknown> | undefined
  ): void {
    this.selelectMethod.emit({ shippingMethodId, metadata });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
