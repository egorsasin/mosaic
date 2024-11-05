import { Inject, Injectable } from '@angular/core';
import { distinctUntilChanged, map, Subject } from 'rxjs';

import { ShippingMethodQuote } from '@mosaic/common';

import { DataService, GET_ELIGIBLE_SHIPPING_METHODS } from '../../data';
import { SHIPPING_METHOD_HANDLER, ShippingHandler } from '../../shipping';

export type GetEligibleShippingMethodsQuery = {
  eligibleShippingMethods: ShippingMethodQuote[];
};

@Injectable()
export class CheckoutService {
  private shippingMethodsQuery =
    this.dataService.query<GetEligibleShippingMethodsQuery>(
      GET_ELIGIBLE_SHIPPING_METHODS
    );
  private shippingMethod = new Subject<string>();

  public shippingMethods$ = this.shippingMethodsQuery.stream$.pipe(
    map((data) => data.eligibleShippingMethods)
  );

  public shippingMethod$ = this.shippingMethod.pipe(distinctUntilChanged());

  constructor(
    private dataService: DataService,
    @Inject(SHIPPING_METHOD_HANDLER) private shippingHandler: ShippingHandler[]
  ) {}

  public refetchShippingMethods(): void {
    this.shippingMethodsQuery.ref.refetch();
  }

  public selectShippingMethod(code: string) {
    const shippingMethodHandler = this.shippingHandler.find(
      (shippingMethod) => shippingMethod.code === code
    );

    if (!shippingMethodHandler) {
      this.shippingMethod.next(code);
    }
  }
}
