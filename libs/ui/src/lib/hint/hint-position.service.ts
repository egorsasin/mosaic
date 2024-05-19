import { ElementRef, Injectable, NgZone } from '@angular/core';
import { MonoTypeOperatorFunction, Observable, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';

import { MosPoint, PositionAccessor } from '../types';

@Injectable()
export class HintPositionService extends Observable<{
  top: number;
  left: number;
}> {
  constructor(
    { nativeElement }: ElementRef<HTMLElement>,
    ngZone: NgZone,
    positionAccessor: PositionAccessor
  ) {
    const animationFrame = new Observable<void>(
      (subscriber: Subscriber<void>) => {
        let id = NaN;
        const callback = () => {
          subscriber.next();
          id = requestAnimationFrame(callback);
        };

        id = requestAnimationFrame(callback);

        return () => {
          cancelAnimationFrame(id);
        };
      }
    );

    super((subscriber: Subscriber<unknown>) =>
      animationFrame
        .pipe(
          map(() => nativeElement.getBoundingClientRect()),
          map((rect: DOMRect): MosPoint => positionAccessor.getPosition(rect)),
          this.runZoneFree(ngZone)
        )
        .subscribe(subscriber)
    );
  }

  private runZoneFree(ngZone: NgZone): MonoTypeOperatorFunction<MosPoint> {
    return (source) =>
      new Observable((subscriber) =>
        ngZone.runOutsideAngular(() => source.subscribe(subscriber))
      );
  }
}
