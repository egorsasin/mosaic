import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BaseListComponent, ListOptions } from '../../../common/base-list';
import { PaymentMethod } from '../types';
import { PaymentMethodDataService } from '../payment-method.service';
import { PaginatedList } from '@mosaic/common';

@Component({
  selector: 'mos-payment-list',
  templateUrl: './payment-list.component.html',
})
export class PaymentListComponent
  extends BaseListComponent<any, PaymentMethod>
  implements OnInit
{
  constructor(
    activateRoute: ActivatedRoute,
    private dataService: PaymentMethodDataService
  ) {
    super(activateRoute);

    super.setQueryFn(
      (args: ListOptions) => this.dataService.getPaymentMethods(args),
      (data: {
        paymentMethods: PaginatedList<PaymentMethod>;
      }): PaginatedList<PaymentMethod> => data.paymentMethods
    );
  }

  public override ngOnInit() {
    super.ngOnInit();
  }
}
