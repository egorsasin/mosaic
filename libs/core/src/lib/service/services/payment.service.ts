import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { RequestContext } from '../../api/common';
import { Order, Payment } from '../../data';
import { DATA_SOURCE_PROVIDER } from '../../data/constants';
import { PaymentStateMachine } from '../helpers';
import { PaymentState } from '../../types';

import { PaymentMethodService } from './payment-method.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private paymentMethodService: PaymentMethodService,
    private paymentStateMachine: PaymentStateMachine
  ) {}

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

    // this.eventBus.publish(
    //   new PaymentStateTransitionEvent(
    //     initialState,
    //     result.state,
    //     ctx,
    //     payment,
    //     order
    //   )
    // );
    await finalize();

    return payment;
  }
}
