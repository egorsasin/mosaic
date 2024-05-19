import { Order, PaymentMethod } from '../../data';
import { RequestContext } from '../../api/common';
import {
  ConfigArgs,
  ConfigurableOperationDef,
  ConfigurableOperationDefOptions,
} from '../../common';
import {
  ConfigArg,
  ConfigArgValues,
  PaymentMetadata,
  PaymentState,
} from '../../types';
import {
  ConfigArgDefinition,
  ConfigurableOperationDefinition,
} from '@mosaic/common';

export interface CreatePaymentResult {
  amount: number;
  state: Exclude<PaymentState, 'Error'>;
  transactionId?: string;
  errorMessage?: string;
  metadata?: PaymentMetadata;
}

export interface CreatePaymentErrorResult {
  amount: number;
  state: 'Error';
  transactionId?: string;
  errorMessage: string;
  metadata?: PaymentMetadata;
}

export type CreatePaymentFn<T extends ConfigArgs> = (
  ctx: RequestContext,
  order: Order,
  amount: number,
  args: ConfigArgValues<T>,
  metadata: PaymentMetadata,
  method: PaymentMethod
) =>
  | CreatePaymentResult
  | CreatePaymentErrorResult
  | Promise<CreatePaymentResult | CreatePaymentErrorResult>;

export interface PaymentMethodConfigOptions<T extends ConfigArgs>
  extends ConfigurableOperationDefOptions<T> {
  createPayment: CreatePaymentFn<T>;
  /**
   * @description
   * This function provides the logic for settling a payment, also known as "capturing".
   * For payment integrations that settle/capture the payment on creation (i.e. the
   * `createPayment()` method returns with a state of `'Settled'`) this method
   * need only return `{ success: true }`.
   */
  //settlePayment: SettlePaymentFn<T>;
  /**
   * @description
   * This function provides the logic for cancelling a payment, which would be invoked when a call is
   * made to the `cancelPayment` mutation in the Admin API. Cancelling a payment can apply
   * if, for example, you have created a "payment intent" with the payment provider but not yet
   * completed the payment. It allows the incomplete payment to be cleaned up on the provider's end
   * if it gets cancelled via Vendure.
   *
   * @since 1.7.0
   */
  //cancelPayment?: CancelPaymentFn<T>;
  /**
   * @description
   * This function provides the logic for refunding a payment created with this
   * payment method. Some payment providers may not provide the facility to
   * programmatically create a refund. In such a case, this method should be
   * omitted and any Refunds will have to be settled manually by an administrator.
   */
  //createRefund?: CreateRefundFn<T>;
  /**
   * @description
   * This function, when specified, will be invoked before any transition from one {@link PaymentState} to another.
   * The return value (a sync / async `boolean`) is used to determine whether the transition is permitted.
   */
  // onStateTransitionStart?: OnTransitionStartFn<
  //   PaymentState,
  //   PaymentTransitionData
  // >;
}

export class PaymentMethodHandler<
  T extends ConfigArgs = ConfigArgs
> extends ConfigurableOperationDef<T> {
  private readonly createPaymentFn: CreatePaymentFn<T>;

  constructor(config: PaymentMethodConfigOptions<T>) {
    super(config);
    this.createPaymentFn = config.createPayment;
  }

  public async createPayment(
    ctx: RequestContext,
    order: Order,
    amount: number,
    args: ConfigArg[],
    metadata: PaymentMetadata,
    method: PaymentMethod
  ) {
    const paymentConfig = await this.createPaymentFn(
      ctx,
      order,
      amount,
      this.argsArrayToHash(args),
      metadata,
      method
    );
    return {
      method: this.code,
      metadata: {},
      ...paymentConfig,
    };
  }
}
