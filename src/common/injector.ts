import { Type } from '@nestjs/common';
import { ContextId, ModuleRef } from '@nestjs/core';

export class Injector {
  constructor(private moduleRef: ModuleRef) {}

  get<T, R = T>(typeOrToken: Type<T> | string | symbol): R {
    return this.moduleRef.get(typeOrToken, { strict: false });
  }

  resolve<T, R = T>(
    typeOrToken: Type<T> | string | symbol,
    contextId?: ContextId,
  ): Promise<R> {
    return this.moduleRef.resolve(typeOrToken, contextId, { strict: false });
  }
}
