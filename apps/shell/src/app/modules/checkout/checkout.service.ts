import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { ShippingMethodQuote } from '@mosaic/common';

import { DataService } from '../../data';
import { GET_ELIGIBLE_SHIPPING_METHODS } from '../../common';

export type GetEligibleShippingMethodsQuery = {
  eligibleShippingMethods: ShippingMethodQuote[];
};

@Injectable()
export class CheckoutService {
  private shippingMethodsQuery =
    this.dataService.query<GetEligibleShippingMethodsQuery>(
      GET_ELIGIBLE_SHIPPING_METHODS
    );

  public shippingMethods$ = this.shippingMethodsQuery.stream$.pipe(
    map((data) => data.eligibleShippingMethods)
  );

  public refetchShippingMethods(): void {
    this.shippingMethodsQuery.ref.refetch();
  }

  constructor(private dataService: DataService) {}
}
