import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

import { GET_ACTIVE_ORDER } from './active-order.definitions';

import { GetActiveOrder } from './active-order.types';
import { DataService } from '../data/data.service';
import { Order } from '../types';

@Injectable({
  providedIn: 'root',
})
export class ActiveOrderService {
  public activeOrder$: Observable<Order>;

  constructor(private dataService: DataService) {
    this.activeOrder$ = this.dataService
      .query<GetActiveOrder.Query>(GET_ACTIVE_ORDER)
      .stream$.pipe(
        map(({ activeOrder }) => activeOrder),
        shareReplay(1)
      );
  }
}
