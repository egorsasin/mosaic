import { ElementRef, Injectable } from '@angular/core';
import { fromEvent, merge, Observable, Subscriber } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable()
export class HoveredService extends Observable<boolean> {
  private readonly stream$: Observable<boolean> = merge(
    fromEvent(this.elementRef.nativeElement, 'mouseenter').pipe(
      map(() => true)
    ),
    fromEvent(this.elementRef.nativeElement, 'mouseleave').pipe(
      map(() => false)
    )
  ).pipe(distinctUntilChanged());

  constructor(private elementRef: ElementRef) {
    super((subscriber: Subscriber<boolean>) =>
      this.stream$.subscribe(subscriber)
    );
  }
}
