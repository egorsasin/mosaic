import { Type } from '@nestjs/common';

import { EmailEventHandler } from './handler';
import { EventWithContext } from './types';

export class EmailEventListener<T extends string> {
  public type: T;
  constructor(type: T) {
    this.type = type;
  }

  public on<Event extends EventWithContext>(
    event: Type<Event>
  ): EmailEventHandler<T, Event> {
    return new EmailEventHandler<T, Event>(this, event);
  }
}
