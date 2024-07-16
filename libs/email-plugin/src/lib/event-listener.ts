import { Type } from '@nestjs/common';

import { EmailEventHandler } from './handler';
import { EventWithContext } from './types';

export class EmailEventListener<T extends string> {
  public type: T;

  constructor(type: T) {
    this.type = type;
  }

  public on<E extends EventWithContext>(
    event: Type<E>
  ): EmailEventHandler<T, E> {
    return new EmailEventHandler<T, E>(this, event);
  }
}
