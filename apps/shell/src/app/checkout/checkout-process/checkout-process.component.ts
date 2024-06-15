import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  Observable,
  Subject,
  concatMap,
  forkJoin,
  map,
  mergeMap,
  take,
} from 'rxjs';

import { WINDOW } from '@mosaic/cdk';
import {
  Exact,
  MutationArgs,
  PaymentMethodQuote,
  ShippingMethodQuote,
  CreateCustomerInput,
  AddressInput,
  NoActiveOrderError,
  Order,
  OrderLine,
} from '@mosaic/common';

import { DataService } from '../../data';
import {
  ADD_PAYMENT,
  GET_ELIGIBLE_PAYMENT_METHODS,
  GET_ELIGIBLE_SHIPPING_METHODS,
  SET_CUSTOMER_FOR_ORDER,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
} from './checkout-process.graphql';

import { ActiveOrderService } from '../../active-order';
import { CREATE_PAYNOW_PAYMENT_INTENT } from './paynow.graphql';
import { ADJUST_ITEM_QUANTITY, REMOVE_ITEM_FROM_CART } from './cart.graphql';

export type GetEligiblePaymentMethodsQuery = {
  eligiblePaymentMethods: PaymentMethodQuote[];
};

export type GetEligibleShippingMethodsQuery = {
  eligibleShippingMethods: ShippingMethodQuote[];
};

export type SetShippingMethodMutationVariables = {
  shippingMethodId: number;
  metadata?: string;
};

export enum ErrorCode {
  ORDER_PAYMENT_STATE_ERROR = 'ORDER_PAYMENT_STATE_ERROR',
}

type GraphQLError = { errorCode: ErrorCode; message: string };

export type RemoveItemFromCartMutationVariables = Exact<{
  id: number;
}>;

export type RemoveItemFromCartMutation = {
  removeOrderLine: Order | GraphQLError;
};

export type AdjustItemQuantityMutationVariables = Exact<{
  id: number;
  quantity: number;
}>;

export type AdjustItemQuantityMutation = {
  adjustOrderLine: Order | GraphQLError;
};

export const FADE_UP_ANIMATION = trigger(`fadeUpAnimation`, [
  transition(':leave', [
    animate(
      '200ms ease-in',
      style({ opacity: 0, transform: 'translateY(-100%)' })
    ),
  ]),
]);

export interface CheckoutForm {
  emailAddress: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phoneNumber: FormControl<string>;
  city: FormControl<string>;
  postalCode: FormControl<string>;
  streetLine: FormControl<string>;
}

@Component({
  selector: 'mos-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FADE_UP_ANIMATION],
})
export class CheckoutProcessComponent implements OnDestroy {
  private shippingMethodsQuery =
    this.dataService.query<GetEligibleShippingMethodsQuery>(
      GET_ELIGIBLE_SHIPPING_METHODS
    );

  public order$: Observable<Order> = this.activeOrderService.activeOrder$;
  public shippingMethods$ = this.shippingMethodsQuery.stream$.pipe(
    map((data) => data.eligibleShippingMethods)
  );

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

  public shippingMethod: FormControl<string | null> = new FormControl<
    string | null
  >(null);

  public paymentMethods$: Observable<PaymentMethodQuote[]> = this.dataService
    .query<GetEligiblePaymentMethodsQuery>(GET_ELIGIBLE_PAYMENT_METHODS)
    .stream$.pipe(map((res) => res.eligiblePaymentMethods));

  public form: FormGroup<CheckoutForm> = this.formBuilder.group<CheckoutForm>({
    emailAddress: this.formBuilder.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.email],
    }),
    firstName: this.formBuilder.nonNullable.control<string>('', {
      validators: Validators.required,
    }),
    lastName: this.formBuilder.nonNullable.control<string>('', {
      validators: Validators.required,
    }),
    phoneNumber: this.formBuilder.nonNullable.control<string>('', {
      validators: Validators.required,
    }),
    city: this.formBuilder.nonNullable.control<string>('', {
      validators: Validators.required,
    }),
    postalCode: this.formBuilder.nonNullable.control<string>('', {
      validators: Validators.required,
    }),
    streetLine: this.formBuilder.nonNullable.control<string>('', {
      validators: Validators.required,
    }),
  });

  public items$ = this.order$.pipe(map((order) => order.lines));

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    @Inject(WINDOW) private window: Window,
    private dataService: DataService,
    private activeOrderService: ActiveOrderService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // this.form.valueChanges
    //   .pipe(
    //     filter(() => this.form.valid),
    //     debounceTime(300),
    //     map(() => this.form.getRawValue()),
    //     switchMap(({ firstName, lastName, phoneNumber, emailAddress }) =>
    //       this.dataService.mutate<unknown, MutationArgs<CreateCustomerInput>>(
    //         SET_CUSTOMER_FOR_ORDER,
    //         {
    //           input: {
    //             firstName,
    //             lastName,
    //             phoneNumber,
    //             emailAddress,
    //           },
    //         }
    //       )
    //     ),
    //     takeUntil(this.destroy$)
    //   )
    //   .subscribe((value) => {});
  }

  public completeOrder(order: Order): void {
    if (this.form.invalid) {
      return;
    }

    const { emailAddress, ...shippingAddress } = this.form.getRawValue();
    const setShippingAddress$ = this.dataService.mutate<
      NoActiveOrderError | Order,
      MutationArgs<AddressInput>
    >(SET_SHIPPING_ADDRESS, {
      input: shippingAddress,
    });

    const { firstName, lastName, phoneNumber } = shippingAddress;
    const setCustomer$ = this.dataService.mutate<
      unknown,
      MutationArgs<CreateCustomerInput>
    >(SET_CUSTOMER_FOR_ORDER, {
      input: {
        firstName,
        lastName,
        phoneNumber,
        emailAddress,
      },
    });

    setCustomer$.pipe(mergeMap(() => setShippingAddress$)).subscribe(() => {
      this.addPaymentMethod();
    });
  }

  private addPaymentMethod() {
    // if (this.paymentMethod.value === 'paynow') {
    //   return this.dataService
    //     .mutate<any, MutationArgs<any>>(CREATE_PAYNOW_PAYMENT_INTENT, {
    //       input: {
    //         orderId: order.id,
    //       },
    //     })
    //     .subscribe(({ createPaynowIntent }) => {
    //       if (createPaynowIntent.url) {
    //         this.window.open(createPaynowIntent.url, '_self');
    //       }
    //     });
    // } else {
    return this.dataService
      .mutate<any, any>(ADD_PAYMENT, {
        input: {
          method: this.paymentMethod.value,
          metadata: {},
        },
      })
      .subscribe(async ({ addPaymentToOrder: result }) => {
        switch (result?.__typename) {
          case 'Order':
            if (
              ['PaymentSettled', 'PaymentAuthorized'].includes(result?.state)
            ) {
              //  await new Promise<void>((resolve) =>
              //    setTimeout(() => {
              //      this.stateService.setState('activeOrderId', null);
              //      resolve();
              //    }, 500)
              //  );
              this.router.navigate(['../confirmation', result.code], {
                relativeTo: this.activatedRoute,
              });
            }
          //         break;
          //       case 'OrderPaymentStateError':
          //       case 'PaymentDeclinedError':
          //       case 'PaymentFailedError':
          //       case 'OrderStateTransitionError':
          //         this.paymentErrorMessage = addPaymentToOrder.message;
          //         break;
        }
      });
  }

  public setShippingMethod(shippingMethodId: number): void {
    this.dataService
      .mutate<
        AdjustItemQuantityMutation,
        MutationArgs<SetShippingMethodMutationVariables>
      >(SET_SHIPPING_METHOD, {
        input: {
          shippingMethodId,
        },
      })
      .pipe(take(1))
      .subscribe();
  }

  public onQuantityChange({ id }: OrderLine, quantity: number) {
    this.dataService
      .mutate<AdjustItemQuantityMutation, AdjustItemQuantityMutationVariables>(
        ADJUST_ITEM_QUANTITY,
        {
          id,
          quantity,
        }
      )
      .pipe(take(1))
      .subscribe(() => this.shippingMethodsQuery.ref.refetch());
  }

  public removeItem(id: number) {
    this.dataService
      .mutate<RemoveItemFromCartMutation, RemoveItemFromCartMutationVariables>(
        REMOVE_ITEM_FROM_CART,
        {
          id,
        }
      )
      .pipe(take(1))
      .subscribe(() => this.shippingMethodsQuery.ref.refetch());
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
