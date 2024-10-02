import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityNotFoundError } from 'typeorm';

import { RequestContext } from '../../api/common';
import { Order, Payment } from '../../data';
import { DATA_SOURCE_PROVIDER } from '../../data/constants';
import { PaymentStateMachine } from '../helpers/payment-state-machine';
import { PaymentMetadata, PaymentState } from '../../types';
import { EventBus, PaymentStateTransitionEvent } from '../../event-bus';
import { PaymentStateTransitionError } from '../../common';
import { SettlePaymentErrorResult } from '../../config';

import { PaymentMethodService } from './payment-method.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private paymentMethodService: PaymentMethodService,
    private paymentStateMachine: PaymentStateMachine,
    private eventBus: EventBus
  ) {}

  public async findOneOrThrow(
    ctx: RequestContext,
    id: number,
    relations: string[] = ['order']
  ): Promise<Payment> {
    const payment = await this.dataSource
      .getRepository(Payment)
      .findOne({ where: { id }, relations });

    if (!payment) {
      throw new EntityNotFoundError(Payment.name, id);
    }

    return payment;
  }

  public async createPayment(
    ctx: RequestContext,
    order: Order,
    amount: number,
    method: string,
    metadata: Record<string, unknown>
  ): Promise<Payment> {
    const { paymentMethod, handler } =
      await this.paymentMethodService.getMethodAndOperations(ctx, method);

    // if (paymentMethod.checker && checker) {
    //   const eligible = await checker.check(
    //     ctx,
    //     order,
    //     paymentMethod.checker.args,
    //     paymentMethod
    //   );
    //   if (eligible === false || typeof eligible === 'string') {
    //     return new IneligiblePaymentMethodError({
    //       eligibilityCheckerMessage:
    //         typeof eligible === 'string' ? eligible : undefined,
    //     });
    //   }
    // }

    const result = await handler.createPayment(
      ctx,
      order,
      amount,
      paymentMethod.handler.args,
      metadata || {},
      paymentMethod
    );

    const initialState: PaymentState = 'Created';
    const payment = await this.dataSource
      .getRepository(Payment)
      .save(new Payment({ ...result, method, state: initialState }));

    const { finalize } = await this.paymentStateMachine.transition(
      ctx,
      order,
      payment,
      result.state
    );

    await this.dataSource
      .getRepository(Payment)
      .save(payment, { reload: false });

    await this.dataSource
      .getRepository(Order)
      .createQueryBuilder()
      .relation(Order, 'payments')
      .of(order)
      .add(payment);

    this.eventBus.publish(
      new PaymentStateTransitionEvent(
        initialState,
        result.state,
        ctx,
        payment,
        order
      )
    );

    await finalize();

    return payment;
  }

  /**
   * @description
   * Переводит платеж {@link Payment} в новое состояние.
   *
   * When updating a Payment in the context of an Order, it is
   * preferable to use the {@link OrderService} `transitionPaymentToState()` method, which will also handle
   * updating the Order state too.
   */
  public async transitionToState(
    ctx: RequestContext,
    paymentId: number,
    state: PaymentState
  ): Promise<Payment | PaymentStateTransitionError> {
    if (state === 'Settled') {
      return this.settlePayment(ctx, paymentId);
    }

    if (state === 'Cancelled') {
      return this.cancelPayment(ctx, paymentId);
    }

    const payment = await this.findOneOrThrow(ctx, paymentId);
    const fromState = payment.state;

    return this.transitionStateAndSave(ctx, payment, fromState, state);
  }

  /**
   * @description
   * Settles a Payment.
   *
   * When settling a Payment in the context of an Order, it is
   * preferable to use the {@link OrderService} `settlePayment()` method, which will also handle
   * updating the Order state too.
   */
  public async settlePayment(
    ctx: RequestContext,
    paymentId: number
  ): Promise<PaymentStateTransitionError | Payment> {
    const payment = await this.findOneOrThrow(ctx, paymentId);
    const { paymentMethod, handler } =
      await this.paymentMethodService.getMethodAndOperations(
        ctx,
        payment.method
      );
    const settlePaymentResult = await handler.settlePayment(
      ctx,
      payment.order,
      payment,
      paymentMethod.handler.args,
      paymentMethod
    );
    const fromState = payment.state;

    let toState: PaymentState;

    payment.metadata = this.mergePaymentMetadata(
      payment.metadata,
      settlePaymentResult.metadata
    );

    if (settlePaymentResult.success) {
      toState = 'Settled';
    } else {
      toState =
        (settlePaymentResult as SettlePaymentErrorResult).state || 'Error';
      payment.errorMessage = (
        settlePaymentResult as SettlePaymentErrorResult
      ).errorMessage;
    }

    return this.transitionStateAndSave(ctx, payment, fromState, toState);
  }

  public async cancelPayment(
    ctx: RequestContext,
    paymentId: number
  ): Promise<PaymentStateTransitionError | Payment> {
    const payment = await this.findOneOrThrow(ctx, paymentId);
    const { paymentMethod, handler } =
      await this.paymentMethodService.getMethodAndOperations(
        ctx,
        payment.method
      );
    const cancelPaymentResult = await handler.cancelPayment(
      ctx,
      payment.order,
      payment,
      paymentMethod.handler.args,
      paymentMethod
    );
    const fromState = payment.state;

    let toState: PaymentState;

    payment.metadata = this.mergePaymentMetadata(
      payment.metadata,
      cancelPaymentResult?.metadata
    );

    if (cancelPaymentResult == null || cancelPaymentResult.success) {
      toState = 'Cancelled';
    } else {
      toState =
        (cancelPaymentResult as SettlePaymentErrorResult).state || 'Error';
      payment.errorMessage = (
        cancelPaymentResult as SettlePaymentErrorResult
      ).errorMessage;
    }

    return this.transitionStateAndSave(ctx, payment, fromState, toState);
  }

  private async transitionStateAndSave(
    ctx: RequestContext,
    payment: Payment,
    fromState: PaymentState,
    toState: PaymentState
  ) {
    if (fromState === toState) {
      // Если были изменения в метаданных
      await this.dataSource
        .getRepository(Payment)
        .save(payment, { reload: false });
      return payment;
    }

    let finalize: () => Promise<unknown>;

    try {
      const result = await this.paymentStateMachine.transition(
        ctx,
        payment.order,
        payment,
        toState
      );
      finalize = result.finalize;
    } catch (e: any) {
      return new PaymentStateTransitionError({
        transitionError: e.message,
        fromState,
        toState,
      });
    }

    await this.dataSource
      .getRepository(Payment)
      .save(payment, { reload: false });
    await this.eventBus.publish(
      new PaymentStateTransitionEvent(
        fromState,
        toState,
        ctx,
        payment,
        payment.order
      )
    );

    await finalize();

    return payment;
  }

  private mergePaymentMetadata(
    m1: PaymentMetadata,
    m2?: PaymentMetadata
  ): PaymentMetadata {
    if (!m2) {
      return m1;
    }
    const merged = { ...m1, ...m2 };
    if (m1.public && m1.public) {
      merged.public = { ...(m1.public as any), ...(m2.public as any) };
    }
    return merged;
  }
}
