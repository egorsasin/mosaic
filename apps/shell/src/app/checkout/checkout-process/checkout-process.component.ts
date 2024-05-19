import { ChangeDetectionStrategy, Component } from '@angular/core';
import { gql } from 'apollo-angular';

import { MutationArgs, PaymentInput, PaymentMethodQuote } from '@mosaic/common';

import { DataService } from '../../data';
import {
  ADD_PAYMENT,
  GET_ELIGIBLE_PAYMENT_METHODS,
} from './checkout-process.graphql';
import { map } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Order } from '../../types';

export type GetEligiblePaymentMethodsQuery = {
  eligiblePaymentMethods: PaymentMethodQuote[];
};

export enum ErrorCode {
  ORDER_PAYMENT_STATE_ERROR = 'ORDER_PAYMENT_STATE_ERROR',
}

type ApiError = { errorCode: ErrorCode; message: string };
type AddPaymentMutation = { addPaymentToOrder: ApiError | Order };

@Component({
  selector: 'mos-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutProcessComponent {
  public maskConfig = {
    mask: [
      '+',
      '4',
      '8',
      ' ',
      /[1-9]/,
      /\d/,
      /\d/,
      '-',
      /\d/,
      /\d/,
      /\d/,
      '-',
      /\d/,
      /\d/,
      /\d/,
    ],
    guide: false,
  };

  public paymentMethod = new FormControl();

  public paymentMethods$ = this.dataService
    .query<GetEligiblePaymentMethodsQuery>(GET_ELIGIBLE_PAYMENT_METHODS)
    .stream$.pipe(map((res: any) => res.eligiblePaymentMethods));

  constructor(private dataService: DataService) {
    this.paymentMethods$.subscribe((paymentMethods) => {
      console.log(paymentMethods);
    });
  }

  public addPaymentMethod() {
    this.dataService
      .mutate<AddPaymentMutation, MutationArgs<PaymentInput>>(ADD_PAYMENT, {
        input: {
          method: this.paymentMethod.value,
          metadata: {},
        },
      })
      .subscribe(async ({ addPaymentToOrder }) => {
        console.log(addPaymentToOrder);
      });
  }

  public completeOrder() {
    // this.dataService
    //   .mutate<any, any>(COMPLETE_ORDER, {
    //     input: {},
    //   })
    //   .subscribe(async ({ addPaymentToOrder }) => {
    //     switch (addPaymentToOrder?.__typename) {
    //       case 'Order':
    //         const order = addPaymentToOrder;
    //         if (
    //           order &&
    //           (order.state === 'PaymentSettled' ||
    //             order.state === 'PaymentAuthorized')
    //         ) {
    //           await new Promise<void>((resolve) =>
    //             setTimeout(() => {
    //               this.stateService.setState('activeOrderId', null);
    //               resolve();
    //             }, 500)
    //           );
    //           this.router.navigate(['../confirmation', order.code], {
    //             relativeTo: this.route,
    //           });
    //         }
    //         break;
    //       case 'OrderPaymentStateError':
    //       case 'PaymentDeclinedError':
    //       case 'PaymentFailedError':
    //       case 'OrderStateTransitionError':
    //         this.paymentErrorMessage = addPaymentToOrder.message;
    //         break;
    //     }
    // });
  }
}
