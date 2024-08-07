import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

import { Order } from '@mosaic/common';

import { DataService } from '../data/data.service';
import { QueryResult } from '../data/query-result';
import { GET_ACTIVE_ORDER } from '../common';

import { GetActiveOrder } from './active-order.types';

@Injectable({
  providedIn: 'root',
})
export class ActiveOrderService {
  public activeOrder$: Observable<Order>;

  private query$: QueryResult<{ activeOrder: Order }> =
    this.dataService.query<GetActiveOrder.Query>(GET_ACTIVE_ORDER);

  constructor(private dataService: DataService) {
    this.activeOrder$ = this.query$.stream$.pipe(
      map(({ activeOrder }) => activeOrder),
      shareReplay(1)
    );
  }
}
