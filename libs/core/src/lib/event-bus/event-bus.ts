import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { Injectable, OnModuleDestroy, Type } from '@nestjs/common';

import { notNullOrUndefined } from '@mosaic/common';

import { MosaicEvent } from './event';

export type BlockingEventHandlerOptions<T extends MosaicEvent = MosaicEvent> = {
  event: Type<T> | Array<Type<T>>;
  handler: (event: T) => void | Promise<void>;
  id: string;
  before?: string;
  after?: string;
};

@Injectable()
export class EventBus implements OnModuleDestroy {
  private eventStream$ = new Subject<MosaicEvent>();
  private destroy$ = new Subject<void>();
  private blockingEventHandlers = new Map<
    Type<MosaicEvent>,
    Array<BlockingEventHandlerOptions>
  >();

  public async publish<T extends MosaicEvent>(event: T): Promise<void> {
    this.eventStream$.next(event);
    await this.executeBlockingEventHandlers(event);
  }

  public ofType<T extends MosaicEvent>(type: Type<T>): Observable<T> {
    return this.eventStream$.asObservable().pipe(
      takeUntil(this.destroy$),
      filter((e) => (e as MosaicEvent).constructor === type)
    ) as Observable<T>;
  }

  public filter<T extends MosaicEvent>(
    predicate: (event: MosaicEvent) => boolean
  ): Observable<T> {
    return this.eventStream$.asObservable().pipe(
      takeUntil(this.destroy$),
      filter((e) => predicate(e)),
      //mergeMap((event) => this.awaitActiveTransactions(event)),
      filter(notNullOrUndefined)
    ) as Observable<T>;
  }

  public publicregisterBlockingEventHandler<T extends MosaicEvent>(
    handlerOptions: BlockingEventHandlerOptions<T>
  ) {
    const events = Array.isArray(handlerOptions.event)
      ? handlerOptions.event
      : [handlerOptions.event];

    for (const event of events) {
      let handlers = this.blockingEventHandlers.get(event);
      const handlerWithIdAlreadyExists = handlers?.some(
        (handler) => handler.id === handlerOptions.id
      );
      if (handlerWithIdAlreadyExists) {
        throw new Error(
          `A handler with the id "${handlerOptions.id}" is already registered for the event ${event.name}`
        );
      }

      if (handlers) {
        handlers.push(handlerOptions);
      } else {
        handlers = [handlerOptions];
      }

      const orderedHandlers = this.orderEventHandlers(handlers);

      this.blockingEventHandlers.set(event, orderedHandlers);
    }
  }

  public onModuleDestroy(): void {
    this.destroy$.next();
  }

  private async executeBlockingEventHandlers<T extends MosaicEvent>(
    event: T
  ): Promise<void> {
    const blockingHandlers = this.blockingEventHandlers.get(
      event.constructor as Type<T>
    );
    for (const options of blockingHandlers || []) {
      await options.handler(event);
    }
  }

  private orderEventHandlers<T extends MosaicEvent>(
    handlers: Array<BlockingEventHandlerOptions<T>>
  ): Array<BlockingEventHandlerOptions<T>> {
    let orderedHandlers: Array<BlockingEventHandlerOptions<T>> = [];
    const handlerMap: Map<string, BlockingEventHandlerOptions<T>> = new Map();

    for (const handler of handlers) {
      handlerMap.set(handler.id, handler);
    }

    const addHandler = (handler: BlockingEventHandlerOptions<T>) => {
      if (orderedHandlers.includes(handler)) {
        return;
      }

      if (handler.after) {
        const afterHandler = handlerMap.get(handler.after);
        if (afterHandler) {
          if (afterHandler.after === handler.id) {
            throw new Error(
              `Circular dependency detected between event handlers ${handler.id} and ${afterHandler.id}`
            );
          }
          orderedHandlers = orderedHandlers.filter(
            (h) => h.id !== afterHandler.id
          );
          addHandler(afterHandler);
        }
      }

      orderedHandlers.push(handler);

      if (handler.before) {
        const beforeHandler = handlerMap.get(handler.before);
        if (beforeHandler) {
          if (beforeHandler.before === handler.id) {
            throw new Error(
              `Circular dependency detected between event handlers ${handler.id} and ${beforeHandler.id}`
            );
          }
          orderedHandlers = orderedHandlers.filter(
            (h) => h.id !== beforeHandler.id
          );
          addHandler(beforeHandler);
        }
      }
    };

    for (const handler of handlers) {
      addHandler(handler);
    }

    return orderedHandlers;
  }

  // private async awaitActiveTransactions<T extends MosaicEvent>(
  //   event: T
  // ): Promise<T | undefined> {
  //   const entry = Object.entries(event).find(
  //     ([_, value]) => value instanceof RequestContext
  //   );

  //   if (!entry) {
  //     return event;
  //   }

  //   const [key, ctx]: [string, RequestContext] = entry;

  //   const transactionManager: EntityManager | undefined = ctx[
  //     TRANSACTION_MANAGER_KEY
  //   ];
  //   if (!transactionManager?.queryRunner) {
  //     return event;
  //   }

  //   try {
  //     await this.transactionSubscriber.awaitCommit(
  //       transactionManager.queryRunner
  //     );

  //     // Copy context and remove transaction manager
  //     // This will prevent queries to released query runner
  //     const newContext = ctx.copy();
  //     delete (newContext as any)[TRANSACTION_MANAGER_KEY];

  //     // Reassign new context
  //     (event as any)[key] = newContext;

  //     return event;
  //   } catch (e: any) {
  //     if (e instanceof TransactionSubscriberError) {
  //       // Expected commit, but rollback or something else happened.
  //       // This is still reliable behavior, return undefined
  //       // as event should not be exposed from this transaction
  //       return;
  //     }

  //     throw e;
  //   }
  // }
}
