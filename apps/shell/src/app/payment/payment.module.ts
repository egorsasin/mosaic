import {
  inject,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';

import { PaymentHandler } from './types';
import { PAYMENT_HANDLER } from './tokens';

export function isClass(
  classOrRecord: Type<unknown> | Record<string, unknown>
): classOrRecord is Type<unknown> {
  return typeof classOrRecord === 'function';
}

export function isToken(
  tokenOrRecord:
    | Type<unknown>
    | InjectionToken<unknown>
    | Record<string, unknown>
): tokenOrRecord is Type<unknown> | InjectionToken<unknown> {
  return tokenOrRecord instanceof InjectionToken || isClass(tokenOrRecord);
}

@NgModule({
  declarations: [],
  imports: [],
  providers: [],
  exports: [],
})
export class PaymentModule {
  static forRoot(
    handlers: Type<PaymentHandler>[]
  ): ModuleWithProviders<PaymentModule> {
    return {
      ngModule: PaymentModule,
      providers: [
        {
          provide: PAYMENT_HANDLER,
          multi: true,
          useFactory: createHandlersInstances(handlers),
        },
      ],
    };
  }
}

function createHandlersInstances(handlers: Type<PaymentHandler>[]) {
  return () =>
    handlers.map((handlerTokenOrRecord) =>
      isToken(handlerTokenOrRecord)
        ? inject(handlerTokenOrRecord)
        : handlerTokenOrRecord
    );
}
