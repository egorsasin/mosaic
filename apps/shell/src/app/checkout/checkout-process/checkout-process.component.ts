import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { Exact, MutationArgs, PaymentMethodQuote } from '@mosaic/common';

import { DataService } from '../../data';
import { GET_ELIGIBLE_PAYMENT_METHODS } from './checkout-process.graphql';
import { Observable, map } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { Order } from '../../types';
import { ActiveOrderService } from '../../active-order';
import { CREATE_PAYNOW_PAYMENT_INTENT } from './paynow.graphql';
import { Router } from '@angular/router';
import { WINDOW } from '@mosaic/cdk';
import { REMOVE_ITEM_FROM_CART } from './cart.graphql';

export type GetEligiblePaymentMethodsQuery = {
  eligiblePaymentMethods: PaymentMethodQuote[];
};

export enum ErrorCode {
  ORDER_PAYMENT_STATE_ERROR = 'ORDER_PAYMENT_STATE_ERROR',
}

type GraphQLError = { errorCode: ErrorCode; message: string };

export type RemoveItemFromCartMutationVariables = Exact<{
  id: number;
}>;

export type RemoveItemFromCartMutation = {
  removeOrderLine:
    | Order
    | {
        __typename?: 'OrderModificationError';
        errorCode: ErrorCode;
        message: string;
      };
};

@Component({
  selector: 'mos-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutProcessComponent {
  public order$: Observable<Order> = this.activeOrderService.activeOrder$;
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

  public paymentMethod: FormControl<string | null> = new FormControl<
    string | null
  >(null);

  public paymentMethods$: Observable<PaymentMethodQuote[]> = this.dataService
    .query<GetEligiblePaymentMethodsQuery>(GET_ELIGIBLE_PAYMENT_METHODS)
    .stream$.pipe(map((res) => res.eligiblePaymentMethods));

  public form = new FormGroup({
    email: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    password: new FormControl(''),
    phone: new FormControl(''),
  });

  public items$ = this.activeOrderService.activeOrder$.pipe(
    map((order) => order.lines)
  );

  constructor(
    @Inject(WINDOW) private window: Window,
    private dataService: DataService,
    private activeOrderService: ActiveOrderService,
    private router: Router
  ) {}

  // public addPaymentMethod() {
  //   this.dataService
  //     .mutate<AddPaymentMutation, MutationArgs<PaymentInput>>(ADD_PAYMENT, {
  //       input: {
  //         method: this.paymentMethod.value,
  //         metadata: {},
  //       },
  //     })
  //     .subscribe(async ({ addPaymentToOrder }) => {
  //       console.log(addPaymentToOrder);
  //     });
  // }

  public completeOrder(order: Order) {
    if (this.paymentMethod.value === 'paynow') {
      this.dataService
        .mutate<any, MutationArgs<any>>(CREATE_PAYNOW_PAYMENT_INTENT, {
          input: {
            orderId: order.id,
          },
        })
        .subscribe(({ createPaynowIntent }) => {
          if (createPaynowIntent.url) {
            this.window.open(createPaynowIntent.url, '_self');
          }
        });
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
    }
  }

  public removeItem(id: number) {
    this.dataService
      .mutate<RemoveItemFromCartMutation, RemoveItemFromCartMutationVariables>(
        REMOVE_ITEM_FROM_CART,
        {
          id,
        }
      )
      .subscribe();
  }
}
