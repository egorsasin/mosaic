import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { Injectable, OnModuleDestroy, Type } from '@nestjs/common';

import { MosaicEvent } from './event';

@Injectable()
export class EventBus implements OnModuleDestroy {
  private eventStream$ = new Subject<MosaicEvent>();
  private destroy$ = new Subject<void>();

  public publish<T extends MosaicEvent>(event: T): void {
    this.eventStream$.next(event);
  }

  public ofType<T extends MosaicEvent>(type: Type<T>): Observable<T> {
    return this.eventStream$.asObservable().pipe(
      takeUntil(this.destroy$),
      filter((e) => (e as MosaicEvent).constructor === type)
    ) as Observable<T>;
  }

  public onModuleDestroy(): void {
    this.destroy$.next();
  }
}
