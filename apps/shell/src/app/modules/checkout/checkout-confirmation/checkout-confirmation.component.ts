import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
  filter,
  map,
  mergeMap,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

import { Order } from '@mosaic/common';

@Component({
  selector: 'mos-checkout-confirmation',
  templateUrl: './checkout-confirmation.component.html',
  // styleUrls: ['./checkout-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutConfirmationComponent {
  order$: Observable<Order> = this.activatedRoute.data.pipe(
    tap((data) => console.log(data)),
    map(({ order }) => order)
  );
  // notFound$: Observable<boolean>;

  constructor(private activatedRoute: ActivatedRoute) {}

  //ngOnInit() {
  //     const orderRequest$ = this.route.paramMap.pipe(
  //         map(paramMap => paramMap.get('code')),
  //         filter(notNullOrUndefined),
  //         switchMap(code => this.dataService.query<GetOrderByCodeQuery, GetOrderByCodeQueryVariables>(
  //             GET_ORDER_BY_CODE,
  //             { code },
  //         )),
  //         map(data => data.orderByCode),
  //         shareReplay(1),
  //     );
  //     this.order$ = orderRequest$.pipe(
  //         filter(notNullOrUndefined),
  //     );
  //     this.notFound$ = orderRequest$.pipe(
  //         map(res => !res),
  //     );
  //}

  // register() {
  //     this.order$.pipe(
  //         take(1),
  //         mergeMap(order => {
  //             const customer = order?.customer;
  //             if (customer) {
  //                 return this.dataService.mutate<RegisterMutation, RegisterMutationVariables>(REGISTER, {
  //                     input: {
  //                         emailAddress: customer.emailAddress,
  //                         firstName: customer.firstName,
  //                         lastName: customer.lastName,
  //                     },
  //                 });
  //             } else {
  //                 return of({});
  //             }
  //         }),
  //     ).subscribe(() => {
  //         this.registrationSent = true;
  //         this.changeDetector.markForCheck();
  //     });
  // }
}
