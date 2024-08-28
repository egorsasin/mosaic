import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Order, PaginatedList } from '@mosaic/common';

import { BaseListComponent } from '../../../common/base-list';
import { OrderDataService } from '../order.service';

@Component({
  selector: 'mos-order-list',
  templateUrl: './order-list.component.html',
})
export class OrderListComponent
  extends BaseListComponent<any, Order>
  implements OnInit
{
  constructor(
    activateRoute: ActivatedRoute,
    private dataService: OrderDataService
  ) {
    super(activateRoute);
    super.setQueryFn(
      (args: any) => this.dataService.getOrders(args),
      (data: { orders: PaginatedList<Order> }): PaginatedList<Order> =>
        data.orders
    );
  }

  public override ngOnInit() {
    super.ngOnInit();
  }
}
