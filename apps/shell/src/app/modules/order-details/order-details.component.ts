import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Order } from '@mosaic/common';

@Component({
  selector: 'mos-order-details',
  templateUrl: './order-details.component.html',
  // styleUrls: ['./checkout-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent {
  order$: Observable<Order> = this.activatedRoute.data.pipe(
    map(({ order }) => order)
  );
  public readonly isCheckout = signal(false);

  constructor(private activatedRoute: ActivatedRoute) {
    const state: { isCheckout?: boolean } = inject(Location).getState() as {
      isCheckout?: boolean;
    };

    this.isCheckout.set(Boolean(state.isCheckout));
  }

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
