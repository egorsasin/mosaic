import { InjectionToken } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

export const ANIMATION_FRAME = new InjectionToken<Observable<void>>(
  'An abstraction over animation frame',
  {
    factory: () =>
      new Observable<void>((subscriber: Subscriber<void>) => {
        let id = NaN;
        const callback = () => {
          subscriber.next();
          id = requestAnimationFrame(callback);
        };

        id = requestAnimationFrame(callback);

        return () => {
          cancelAnimationFrame(id);
        };
      }),
  }
);
