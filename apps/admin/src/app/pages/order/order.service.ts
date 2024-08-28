import { Injectable } from '@angular/core';

import { BaseDataService } from '../../data';

import { ORDER_LIST_QUERY } from './order-list/order-list.graphql';

@Injectable()
export class OrderDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getOrders(options: any) {
    return this.baseDataService.query<any, any>(ORDER_LIST_QUERY, {
      options,
    }) as any;
  }
}
