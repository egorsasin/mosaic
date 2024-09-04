import { inject, InjectionToken, Type } from '@angular/core';
import { MOSAIC_CONTEXT } from '@mosaic/cdk';
import { map, Observable, of } from 'rxjs';
import { ShippingMethodService } from './shipping-method.service';

export abstract class ShippingHandler<T = unknown> {
  public abstract code: string;

  public component?: Type<T>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public select(skipCache: boolean): Observable<Record<string, unknown>> {
    return of();
  }
}

export const SHIPPING_METHOD_HANDLER = new InjectionToken<ShippingHandler>(
  'Delivery Method Handler'
);

export abstract class ShippingMethodAbstract<T, U = unknown> {
  public readonly metadata$: Observable<U>;

  constructor() {
    const { code } = inject<ShippingHandler<T>>(MOSAIC_CONTEXT);
    const cache = inject(ShippingMethodService);

    this.metadata$ = cache.metadata.pipe(
      map((metadata) => JSON.parse(metadata[code] as string) as U)
    );
  }
}
