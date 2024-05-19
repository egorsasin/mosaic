import { Order, Payment } from '../../../data';
import { RequestContext } from '../../../api/common';
import { InjectableStrategy } from '../../../common';
import { OnTransitionEndFn, PaymentState, Transitions } from './../../../types';

export interface PaymentTransitionData {
  ctx: RequestContext;
  payment: Payment;
  order: Order;
}

export interface PaymentProcess<State extends string = string>
  extends InjectableStrategy {
  transitions?: Transitions<State, State | PaymentState> &
    Partial<Transitions<PaymentState | State>>;
  onTransitionEnd?: OnTransitionEndFn<
    State | PaymentState,
    PaymentTransitionData
  >;
}
