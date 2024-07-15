import { Type } from '@nestjs/common';

import { Injector } from '@mosaic/core';

import {
  EventWithAsyncData,
  EventWithContext,
  IntermediateEmailDetails,
  LoadDataFn,
} from '../types';
import { EmailEventListener } from '../event-listener';

export class EmailEventHandler<
  T extends string = string,
  Event extends EventWithContext = EventWithContext
> {
  constructor(public listener: EmailEventListener<T>, event: any) {}
}

export class EmailEventHandlerWithAsyncData<
  Data,
  T extends string = string,
  InputEvent extends EventWithContext = EventWithContext,
  Event extends EventWithAsyncData<InputEvent, Data> = EventWithAsyncData<
    InputEvent,
    Data
  >
> extends EmailEventHandler<T, Event> {
  constructor(
    public loadDataFn: LoadDataFn<InputEvent, Data>,
    listener: EmailEventListener<T>,
    event: Type<InputEvent>
  ) {
    super(listener, event);
  }

  public async handle(
    event: Event,
    globals: { [key: string]: any } = {},
    injector: Injector
  ): Promise<IntermediateEmailDetails | undefined> {
    const { ctx } = event;

    return undefined;
  }
}
