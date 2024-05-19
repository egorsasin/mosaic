import { Observable } from 'rxjs';

export type Transitions<State extends string, Target extends string = State> = {
  [S in State]: {
    to: Readonly<Target[]>;
    mergeStrategy?: 'merge' | 'replace';
  };
};

export interface StateMachineConfig<T extends string, Data = undefined> {
  readonly transitions: Transitions<T>;

  onTransitionStart?: OnTransitionStartFn<T, Data>;
  onTransitionEnd?: OnTransitionEndFn<T, Data>;
  onError?: OnTransitionErrorFn<T>;
}

export type OnTransitionStartFn<T extends string, Data> = (
  fromState: T,
  toState: T,
  data: Data
) =>
  | boolean
  | string
  | void
  | Promise<boolean | string | void>
  | Observable<boolean | string | void>;

export type OnTransitionEndFn<T extends string, Data> = (
  fromState: T,
  toState: T,
  data: Data
) => void | Promise<void> | Observable<void>;

export type OnTransitionErrorFn<T extends string> = (
  fromState: T,
  toState: T,
  message?: string
) => void | Promise<void> | Observable<void>;
