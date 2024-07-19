import { Directive, ElementRef, OnDestroy } from '@angular/core';
import { fromEvent, Observable, Subject, takeUntil } from 'rxjs';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form',
})
export class FormActionDirective implements OnDestroy {
  private destroy$ = new Subject<void>();
  private element = this.host.nativeElement;

  public submit$: Observable<Event> = fromEvent(this.element, 'submit').pipe(
    takeUntil(this.destroy$)
  );
  public reset$: Observable<Event> = fromEvent(this.element, 'reset').pipe(
    takeUntil(this.destroy$)
  );

  constructor(private host: ElementRef<HTMLFormElement>) {}

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
