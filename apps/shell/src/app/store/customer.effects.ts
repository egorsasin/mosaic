import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap } from 'rxjs/operators';

import { CustomerService } from '../services';

import * as CustomerActions from './customer.actions';
import { setActiveCustomer } from './customer.actions';
import { Customer } from '../types';

@Injectable()
export class CustomerEffects {
  public loadActiveCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.loadActiveCustomer),
      mergeMap(() => {
        return this.customerService
          .getActiveCustomer()
          .pipe(map((customer: Customer) => setActiveCustomer({ customer })));
      })
    )
  );

  constructor(
    private actions$: Actions,
    private customerService: CustomerService
  ) {}
}
