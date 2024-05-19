import { Injectable } from '@nestjs/common';

import { awaitPromiseOrObservable } from '@mosaic/common';

import { RequestContext } from '../../../api/common';
import { Order } from '../../../data';
import { StateMachineConfig, Transitions } from '../../../types';
import { StateMachine, mergeTransitionDefinitions } from '../../../common';
import { OrderState } from '../../../types';
import { ConfigService } from '../../../config';

declare module '../../../types/order-state' {
  interface OrderStates {
    PaymentSettled: never;
  }
}

export interface OrderTransitionData {
  ctx: RequestContext;
  order: Order;
}

@Injectable()
export class OrderStateMachine {
  readonly config: StateMachineConfig<OrderState, OrderTransitionData>;

  private readonly initialState: OrderState = 'Created';

  constructor(private configService: ConfigService) {
    this.config = this.initConfig();
  }

  public getInitialState(): OrderState {
    return this.initialState;
  }

  public canTransition(
    currentState: OrderState,
    newState: OrderState
  ): boolean {
    return new StateMachine(this.config, currentState).canTransitionTo(
      newState
    );
  }

  public async transition(
    ctx: RequestContext,
    order: Order,
    state: OrderState
  ) {
    const stateMachine = new StateMachine(this.config, order.state);
    const result = await stateMachine.transitionTo(state, { ctx, order });

    order.state = stateMachine.currentState;

    return result;
  }

  private initConfig(): StateMachineConfig<OrderState, OrderTransitionData> {
    const orderProcesses = this.configService.orderOptions.process || [];
    const allTransitions = orderProcesses.reduce(
      (transitions, process) =>
        mergeTransitionDefinitions(
          transitions,
          process.transitions as Transitions<OrderState>
        ),
      {} as Transitions<OrderState>
    );

    return {
      transitions: allTransitions,

      onTransitionEnd: async (fromState, toState, data) => {
        for (const process of orderProcesses) {
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
