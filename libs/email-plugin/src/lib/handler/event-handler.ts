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
  E extends EventWithContext = EventWithContext
> {
  private setRecipientFn?: (event: E) => string;

  private filterFns: Array<(event: E) => boolean> = [];

  public get type(): T {
    return this.listener.type;
  }

  constructor(
    public readonly listener: EmailEventListener<T>,
    public readonly event: Type<E>
  ) {}

  public filter(filterFn: (event: E) => boolean): EmailEventHandler<T, E> {
    this.filterFns.push(filterFn);

    return this;
  }

  public setRecipient(
    setRecipientFn: (event: E) => string
  ): EmailEventHandler<T, E> {
    this.setRecipientFn = setRecipientFn;
    return this;
  }

  public async handle(
    event: E,
    globals: { [key: string]: any } = {},
    injector: Injector
  ): Promise<IntermediateEmailDetails | undefined> {
    for (const filterFn of this.filterFns) {
      if (!filterFn(event)) {
        return;
      }
    }

    const recipient = this.setRecipientFn ? this.setRecipientFn(event) : '';

    return {
      type: this.type,
      recipient,
      from: '{{ fromAddress }}',
      templateVars: { ...globals },
      subject: 'Test email',
      templateFile: 'body.hbs',
      attachments: [],
    };
  }
}

export class EmailEventHandlerWithAsyncData<
  Data,
  T extends string = string,
  E extends EventWithContext = EventWithContext,
  Event extends EventWithAsyncData<E, Data> = EventWithAsyncData<E, Data>
> extends EmailEventHandler<T, E> {
  constructor(
    public loadDataFn: LoadDataFn<E, Data>,
    listener: EmailEventListener<T>,
    event: Type<E>
  ) {
    super(listener, event);
  }
}
