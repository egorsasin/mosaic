import { Injectable } from '@nestjs/common';

import { awaitPromiseOrObservable } from '@mosaic/common';

import { RequestContext } from '../../../api/common';
import { Order, Payment } from '../../../data';
import { PaymentState, StateMachineConfig, Transitions } from '../../../types';
import { StateMachine, mergeTransitionDefinitions } from '../../../common';
import { ConfigService } from '../../../config';

import { PaymentProcess, PaymentTransitionData } from './types';

@Injectable()
export class PaymentStateMachine {
  readonly config: StateMachineConfig<PaymentState, PaymentTransitionData>;
  private readonly initialState: PaymentState = 'Created';

  constructor(private configService: ConfigService) {
    this.config = this.initConfig();
  }

  public getInitialState(): PaymentState {
    return this.initialState;
  }

  public getNextStates(payment: Payment): readonly PaymentState[] {
    const stateMachine = new StateMachine(this.config, payment.state);
    return stateMachine.getNextStates();
  }

  public canTransition(
    currentState: PaymentState,
    newState: PaymentState
  ): boolean {
    return new StateMachine(this.config, currentState).canTransitionTo(
      newState
    );
  }

  public async transition(
    ctx: RequestContext,
    order: Order,
    payment: Payment,
    state: PaymentState
  ) {
    const stateMachine = new StateMachine(this.config, payment.state);
    const result = await stateMachine.transitionTo(state, {
      ctx,
      order,
      payment,
    });
    payment.state = state;
    return result;
  }

  private initConfig(): StateMachineConfig<
    PaymentState,
    PaymentTransitionData
  > {
    const processes: PaymentProcess[] = [
      ...(this.configService.paymentOptions.process ?? []),
    ];
    const allTransitions = processes.reduce(
      (transitions, process) =>
        mergeTransitionDefinitions(
          transitions,
          process.transitions as Transitions<PaymentState>
        ),
      {} as Transitions<PaymentState>
    );

    return {
      transitions: allTransitions,
      onTransitionEnd: async (fromState, toState, data) => {
        // Выполняем все обработчики и процессов оплаты
        for (const process of processes) {
          if (typeof process.onTransitionEnd === 'function') {
            await awaitPromiseOrObservable(
              process.onTransitionEnd(fromState, toState, data)
            );
          }
        }
      },
    };
  }
}
