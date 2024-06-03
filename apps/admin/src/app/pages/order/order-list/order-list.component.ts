import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BaseListComponent, Paginated } from '../../../common/base-list';
import { OrderDataService } from '../order.service';

export interface Order {
  id: number;
}

@Component({
  selector: 'mos-order-list',
  templateUrl: './order-list.component.html',
})
export class OrderListComponent
  extends BaseListComponent<Order>
  implements OnInit
{
  constructor(
    activateRoute: ActivatedRoute,
    private dataService: OrderDataService
  ) {
    super(activateRoute);
    super.setQueryFn(
      (args: any) => this.dataService.getOrders(args),
      (data: { orders: Paginated<Order> }): Paginated<Order> => data.orders
    );
  }

  public override ngOnInit() {
    super.ngOnInit();
  }
}
