import { Injector, Type, InjectionToken } from '@angular/core';

export const MOS_CONTEXT_PAYLOAD = new InjectionToken<Record<string, unknown>>(
  'MOS_CONTEXT_PAYLOAD'
);

export class ContextWrapper<T> {
  constructor(
    public readonly component: Type<T>,
    private readonly injector?: Injector
  ) {}

  public createInjector<C>(injector: Injector, useValue?: C): Injector {
    return Injector.create({
      parent: this.injector || injector,
      providers: [
        {
          provide: MOS_CONTEXT_PAYLOAD,
          useValue,
        },
      ],
    });
  }
}
