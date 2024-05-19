import { InjectableStrategy } from '../../common';
import {
  OrderState,
  OrderStates,
  OrderTransitionData,
  StateMachineConfig,
} from '../../types';

export interface OrderProcess<State extends keyof OrderStates | string>
  extends InjectableStrategy,
    StateMachineConfig<State | OrderState, OrderTransitionData> {}
