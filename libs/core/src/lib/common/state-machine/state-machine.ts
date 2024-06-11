import { Observable, lastValueFrom } from 'rxjs';

import { StateMachineConfig } from '../../types';

export async function awaitPromiseOrObservable<T>(
  value: T | Promise<T> | Observable<T>
): Promise<T> {
  let result = await value;
  if (result instanceof Observable) {
    result = await lastValueFrom(result);
  }
  return result;
}

export class StateMachine<T extends string, Data = any> {
  private readonly _initialState: T;
  private _currentState: T;

  constructor(private config: StateMachineConfig<T, Data>, initialState: T) {
    this._currentState = initialState;
    this._initialState = initialState;
  }

  public get initialState(): T {
    return this._initialState;
  }

  public get currentState(): T {
    return this._currentState;
  }

  async transitionTo(
    state: T,
    data: Data
  ): Promise<{ finalize: () => Promise<unknown> }> {
    const finalizeNoop: () => Promise<unknown> = async () => {
      /**/
    };

    if (this.canTransitionTo(state)) {
      // if (typeof this.config.onTransitionStart === 'function') {
      //   const canTransition = await awaitPromiseOrObservable(
      //     this.config.onTransitionStart(this._currentState, state, data)
      //   );
      //   if (canTransition === false) {
      //     return { finalize: finalizeNoop };
      //   } else if (typeof canTransition === 'string') {
      //     await this.onError(this._currentState, state, canTransition);
      //     return { finalize: finalizeNoop };
      //   }
      // }

      const fromState = this._currentState;
      this._currentState = state;

      return {
        finalize: async () => {
          if (typeof this.config.onTransitionEnd === 'function') {
            await awaitPromiseOrObservable(
              this.config.onTransitionEnd(fromState, state, data)
            );
          }
        },
      };
    } else {
      await this.onError(this._currentState, state);
      return { finalize: finalizeNoop };
    }
  }

  jumpTo(state: T) {
    this._currentState = state;
  }

  getNextStates(): readonly T[] {
    return this.config.transitions[this._currentState]?.to ?? [];
  }

  public canTransitionTo(toState: T): boolean {
    return this.config.transitions[this._currentState]?.to.includes(toState);
  }

  private async onError(fromState: T, toState: T, message?: string) {
    if (typeof this.config.onError === 'function') {
      await awaitPromiseOrObservable(
        this.config.onError(fromState, toState, message)
      );
    }
  }
}
