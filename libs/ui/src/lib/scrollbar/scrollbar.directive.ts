import {
  Directive,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
} from '@angular/core';
import {
  Observable,
  Subject,
  Subscriber,
  fromEvent,
  map,
  merge,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs';
import { MosScrollComponent } from '../scroll/scroll.component';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { MosScrollbarWrapperDirective } from './scrollbar-wrapper.directive';

function getOffsetVertical(
  { clientY }: PointerEvent,
  { top, height }: DOMRect
): number {
  return (clientY - top) / height;
}

const animationFrame$ = new Observable<void>((subscriber: Subscriber<void>) => {
  let id = NaN;
  const callback = () => {
    subscriber.next();
    id = requestAnimationFrame(callback);
  };

  id = requestAnimationFrame(callback);

  return () => {
    cancelAnimationFrame(id);
  };
});

const MIN_WIDTH = 24;

@Directive({
  selector: '[mosScrollbar]',
})
export class MosScrollbarDirective implements OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  private get scrolled(): number {
    const { scrollTop, scrollHeight, clientHeight } = this.computedContainer;

    return scrollTop / (scrollHeight - clientHeight);
  }

  private get computedContainer(): Element {
    const { browserScrollRef } = this.container || {};

    return browserScrollRef?.nativeElement || this.document.documentElement;
  }

  private get view(): number {
    const { clientHeight, scrollHeight } = this.computedContainer;

    return Math.ceil((clientHeight / scrollHeight) * 100) / 100;
  }

  private get compensation(): number {
    const { clientHeight, scrollHeight } = this.computedContainer;

    if ((clientHeight * clientHeight) / scrollHeight > MIN_WIDTH) {
      return 0;
    }

    return MIN_WIDTH / clientHeight;
  }

  private get thumb(): number {
    const compensation = this.compensation || this.view;

    return this.scrolled * (1 - compensation);
  }

  private get nativeElement() {
    return this.elementRef.nativeElement;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly container: MosScrollComponent,
    private readonly wrapper: MosScrollbarWrapperDirective,
    private elementRef: ElementRef,
    private readonly viewportScroller: ViewportScroller,
    ngZone: NgZone
  ) {
    merge(animationFrame$.pipe(throttleTime(50)))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() =>
        ngZone.runOutsideAngular(() => {
          const { style } = this.nativeElement;
          style.top = `${this.thumb * 100}%`;
          style.height = `${this.view * 100}%`;
        })
      );

    fromEvent<PointerEvent>(this.nativeElement, 'pointerdown')
      .pipe(
        tap((event: PointerEvent) => {
          event.stopPropagation();
          event.preventDefault();
        }),
        takeUntil(this.destroy$),
        switchMap((event) => {
          const rect = this.nativeElement.getBoundingClientRect();
          const vertical = getOffsetVertical(event, rect);

          return fromEvent<PointerEvent>(this.document, 'pointermove').pipe(
            takeUntil(fromEvent(this.document, 'pointerup')),
            map((event: PointerEvent) => this.getScrolled(event, vertical))
          );
        })
      )
      .subscribe((event) => {
        ngZone.runOutsideAngular(
          () =>
            (this.container.browserScrollRef.nativeElement.scrollTop = event)
        );
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getScrolled(
    { clientY }: PointerEvent,
    offsetVertical: number
  ): number {
    const { offsetHeight } = this.nativeElement;
    const { top, height } = this.wrapper.nativeElement.getBoundingClientRect();

    const maxTop = this.computedContainer.scrollHeight - height;
    const scrolledTop =
      (clientY - top - offsetHeight * offsetVertical) / (height - offsetHeight);

    return maxTop * scrolledTop;
  }
}
