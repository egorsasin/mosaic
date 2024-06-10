import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

import { GET_ACTIVE_ORDER } from './active-order.definitions';

import { GetActiveOrder } from './active-order.types';
import { DataService } from '../data/data.service';
import { Order } from '../types';
import { QueryResult } from '../data/query-result';

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
