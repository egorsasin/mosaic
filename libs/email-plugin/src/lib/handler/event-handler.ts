import { Type } from '@nestjs/common';

import { Injector } from '@mosaic/core';

import {
  EventWithAsyncData,
  EventWithContext,
  IntermediateEmailDetails,
  LoadDataFn,
  SetTemplateVarsFn,
} from '../types';
import { EmailEventListener } from '../event-listener';

export class EmailEventHandler<
  T extends string = string,
  E extends EventWithContext = EventWithContext
> {
  private setRecipientFn?: (event: E) => string;
  private setTemplateVarsFn?: SetTemplateVarsFn<E>;

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

  public setTemplateVars(
    templateVarsFn: SetTemplateVarsFn<E>
  ): EmailEventHandler<T, E> {
    this.setTemplateVarsFn = templateVarsFn;

    return this;
  }

  public loadData<R>(
    loadDataFn: LoadDataFn<E, R>
  ): EmailEventHandlerWithAsyncData<R, T, E, EventWithAsyncData<E, R>> {
    const asyncHandler = new EmailEventHandlerWithAsyncData(
      loadDataFn,
      this.listener,
      this.event
    );

    asyncHandler.setRecipientFn = this.setRecipientFn;
    asyncHandler.setTemplateVarsFn = this.setTemplateVarsFn;
    // asyncHandler.setAttachmentsFn = this.setAttachmentsFn;
    // asyncHandler.setOptionalAddressFieldsFn = this.setOptionalAddressFieldsFn;
    // asyncHandler.filterFns = this.filterFns;
    // asyncHandler.configurations = this.configurations;
    // asyncHandler.defaultSubject = this.defaultSubject;
    // asyncHandler.from = this.from;
    // asyncHandler._mockEvent = this._mockEvent as any;

    return asyncHandler;
  }

  public async handle(
    event: E,
    globals: { [key: string]: unknown } = {},
    injector: Injector
  ): Promise<IntermediateEmailDetails | undefined> {
    for (const filterFn of this.filterFns) {
      if (!filterFn(event)) {
        return;
      }
    }

    if (this instanceof EmailEventHandlerWithAsyncData) {
      try {
        (event as EventWithAsyncData<E, unknown>).data = await this.loadDataFn({
          event,
          injector,
        });
      } catch (err: unknown) {
        return;
      }
    }

    const recipient = this.setRecipientFn ? this.setRecipientFn(event) : '';
    const templateVars = this.setTemplateVarsFn
      ? this.setTemplateVarsFn(event, globals)
      : {};

    return {
      type: this.type,
      recipient,
      from: '{{ fromAddress }}',
      templateVars: { ...globals, ...templateVars },
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
