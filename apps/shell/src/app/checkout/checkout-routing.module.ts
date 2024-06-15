import { NgModule, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  Router,
  RouterModule,
  Routes,
} from '@angular/router';
import { EMPTY, Observable, catchError, map } from 'rxjs';

import {
  GetOrderByCodeQuery,
  Order,
  QueryOrderByCodeArgs,
} from '@mosaic/common';

import { CheckoutProcessComponent } from './checkout-process/checkout-process.component';
import { CheckoutConfirmationComponent } from './checkout-confirmation';
import { DataService } from '../data';
import { GET_ORDER_BY_CODE } from './checkout-confirmation/checkout-confirmation.graphql';

export const routedComponents = [
  CheckoutProcessComponent,
  CheckoutConfirmationComponent,
];

export const orderResolver: ResolveFn<Order> = (
  route: ActivatedRouteSnapshot
): Observable<Order> => {
  const dataService = inject(DataService);
  const router = inject(Router);
  const code = route.paramMap.get('code') || '';

  return dataService
    .query<GetOrderByCodeQuery, QueryOrderByCodeArgs>(GET_ORDER_BY_CODE, {
      code,
    })
    .single$.pipe(
      map(({ orderByCode }) => {
        if (!orderByCode.id) {
          throw new Error();
        }

        return orderByCode;
      }),
      catchError(() => {
        router.navigate(['/']);
        return EMPTY;
      })
    );
};

export const routes: Routes = [
  {
    path: 'confirmation/:code',
    component: CheckoutConfirmationComponent,
    resolve: { order: orderResolver },
  },
  {
    path: '',
    component: CheckoutProcessComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CheckoutRoutingModule {}
