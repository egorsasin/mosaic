import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, map, mergeMap, take } from 'rxjs';

import { WINDOW } from '@mosaic/cdk';
import {
  Exact,
  MutationArgs,
  PaymentMethodQuote,
  CreateCustomerInput,
  AddressInput,
  NoActiveOrderError,
  Order,
} from '@mosaic/common';

import { DataService, SetShippingMethodVariables } from '../../../data';
import {
  ADD_PAYMENT,
  GET_ELIGIBLE_PAYMENT_METHODS,
  SET_CUSTOMER_FOR_ORDER,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
} from '../../../common';

import { CheckoutService } from '../checkout.service';
import { FADE_IN_OUT_ANIMATION, FADE_UP_ANIMATION } from './animations';
import { PHONEMASK_CONFIG } from './constants';
import { selectActiveOrder, setActiveOrder } from '../../../store';
import { Store } from '@ngrx/store';

export type GetEligiblePaymentMethodsQuery = {
  eligiblePaymentMethods: PaymentMethodQuote[];
};

export enum ErrorCode {
  ORDER_PAYMENT_STATE_ERROR = 'ORDER_PAYMENT_STATE_ERROR',
}

type GraphQLError = {
  __typename: string;
  errorCode: ErrorCode;
  message: string;
};

export type RemoveItemFromCartMutationVariables = Exact<{
  id: number;
}>;

export type RemoveItemFromCartMutation = {
  removeOrderLine: Order | GraphQLError;
};

export type SetOrderShippingMethodMutation = {
  setOrderShippingMethod: Order | GraphQLError;
};

export function markAllAsTouched(formGroup: FormGroup | AbstractControl) {
  if (formGroup instanceof FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        markAllAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}

export interface CheckoutForm {
  acceptAgreement: FormControl<boolean>;
  shippingMethod: FormControl<any | null>;
  paymentMethod: FormControl<string>;
  shippingAddress: FormGroup<DeliveryForm>;
}
export interface DeliveryForm {
  emailAddress: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phoneNumber: FormControl<string>;
  city: FormControl<string>;
  postalCode: FormControl<string>;
  streetLine: FormControl<string>;
}

function isOrder(item: Order | GraphQLError): item is Order {
  return item.__typename === 'Order';
}

@Component({
  selector: 'mos-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FADE_UP_ANIMATION, FADE_IN_OUT_ANIMATION],
})
export class CheckoutProcessComponent implements OnDestroy {
  public order$: Observable<Order> = this.store.select(selectActiveOrder);
  public shippingMethods$ = this.checkoutService.shippingMethods$;
  public readonly submitted = signal(false);

  public phoneMaskConfig = PHONEMASK_CONFIG;

  public paymentMethods$: Observable<PaymentMethodQuote[]> = this.dataService
    .query<GetEligiblePaymentMethodsQuery>(GET_ELIGIBLE_PAYMENT_METHODS)
    .stream$.pipe(map((res) => res.eligiblePaymentMethods));

  public checkoutForm: FormGroup<CheckoutForm> =
    this.formBuilder.group<CheckoutForm>({
      acceptAgreement: new FormControl<boolean>(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
      shippingMethod: this.formBuilder.control<any | null>(null, {
        validators: Validators.required,
      }),
      paymentMethod: this.formBuilder.nonNullable.control<string>('', {
        validators: Validators.required,
      }),
      shippingAddress: this.formBuilder.group<DeliveryForm>({
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
      }),
    });

  public items$ = this.order$.pipe(map((order) => order.lines));

  public get paymentMethod(): FormControl {
    return this.checkoutForm.controls.paymentMethod;
  }

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    @Inject(WINDOW) private window: Window,
    private dataService: DataService,
    private store: Store,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private checkoutService: CheckoutService
  ) {
    this.order$.pipe(take(1)).subscribe((order) => {
      if (order) {
        const { customer = {}, shippingAddress = {}, shippingLine } = order;
        this.checkoutForm.patchValue({
          shippingMethod: shippingLine?.shippingMethod,
          shippingAddress: { ...customer, ...shippingAddress },
        });
      }
    });
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
    markAllAsTouched(this.checkoutForm);
    this.submitted.set(true);

    if (this.checkoutForm.invalid) {
      return;
    }

    const { shippingAddress: deliveryAddress } =
      this.checkoutForm.getRawValue();
    const { emailAddress, ...shippingAddress } = deliveryAddress;
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
          method: this.checkoutForm.value.paymentMethod,
          metadata: {},
        },
      })
      .subscribe(async ({ addPaymentToOrder: result }) => {
        switch (result?.__typename) {
          case 'Order':
            if (
              ['PaymentSettled', 'PaymentAuthorized'].includes(result?.state)
            ) {
              this.store.dispatch(setActiveOrder({ order: null }));
              this.router.navigate(['/order', result.code], {
                relativeTo: this.activatedRoute,
                state: { isCheckout: true },
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

  public setShippingMethod({
    shippingMethodId,
    metadata,
  }: SetShippingMethodVariables): void {
    this.dataService
      .mutate<
        SetOrderShippingMethodMutation,
        MutationArgs<SetShippingMethodVariables>
      >(SET_SHIPPING_METHOD, {
        input: {
          shippingMethodId,
          ...(metadata ? { metadata } : {}),
        },
      })
      .pipe(take(1))
      .subscribe(({ setOrderShippingMethod }) => {
        if (isOrder(setOrderShippingMethod)) {
          const shippingLine = (setOrderShippingMethod as Order).shippingLine;

          this.store.dispatch(
            setActiveOrder({ order: setOrderShippingMethod })
          );

          this.checkoutForm.controls.shippingMethod.setValue(
            shippingLine?.shippingMethod as any
          );
        }
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // private formStatus(): Observable<boolean> {
  //   const submit$ =
  //     this.formAction?.submit$.pipe(tap(() => console.log('___SUBMIT'))) ||
  //     NEVER;
  //   const reset$ = this.formAction?.reset$ || NEVER;

  //   console.log('__SUBMIT', submit$);

  //   const status$: Observable<boolean> = this.form.statusChanges.pipe(
  //     startWith(this.form.status),
  //     map((status) => status === 'INVALID')
  //   );

  //   return merge(
  //     submit$.pipe(map(() => true)),
  //     reset$.pipe(map(() => false))
  //   ).pipe(
  //     withLatestFrom(status$),
  //     map(([submit, status]) => submit && status)
  //   );
  // }
}
