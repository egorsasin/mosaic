import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PositionAccessor } from '../types';
import { HOST_POSITION, PositionProvider } from './dropdown-host.directive';

export const DEFAULT_MAX_HEIGHT = 600;
export const DEFAULT_OFFSET = 0;

const animationFrame$ = new Observable<DOMHighResTimeStamp>((subscriber) => {
  let id = NaN;
  const callback = (timestamp: DOMHighResTimeStamp) => {
    subscriber.next(timestamp);
    id = requestAnimationFrame(callback);
  };

  id = requestAnimationFrame(callback);

  return () => {
    cancelAnimationFrame(id);
  };
});

@Component({
  template: `
    <ng-container *ngTemplateOutlet="templateRef" role="menu"></ng-container>
  `,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'mos-dropdown-menu' },
  styleUrls: ['./dropdown-host.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DropdownHostComponent implements OnDestroy, AfterViewChecked {
  private destroy$: Subject<void> = new Subject<void>();
  private readonly refresh$ = new Subject<void>();

  protected readonly sub = this.refresh$
    .pipe(throttleTime(0), takeUntilDestroyed())
    .subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });

  public get nativeElement() {
    return this.elementRef.nativeElement;
  }

  public templateRef!: TemplateRef<unknown>;

  constructor(
    @Inject(PositionAccessor) private positionAccessor: PositionAccessor,
    @Inject(HOST_POSITION) private host: PositionProvider,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    ngZone: NgZone
  ) {
    animationFrame$.pipe(takeUntil(this.destroy$)).subscribe(() =>
      ngZone.runOutsideAngular(() => {
        const position = this.nativeElement.getBoundingClientRect();
        const { top, left } = this.positionAccessor.getPosition(position);

        this.calculatePosition(top, left);
      })
    );
  }

  public ngAfterViewChecked(): void {
    this.refresh$.next();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculatePosition(top: number, left: number) {
    const { style } = this.nativeElement;
    const rect = this.host.clientRect;
    const { right } = this.nativeElement.getBoundingClientRect();

    const isIntersecting =
      left < rect.right && right > rect.left && top < 2 * DEFAULT_OFFSET;
    const available = isIntersecting
      ? rect.top - 2 * DEFAULT_OFFSET
      : innerHeight - top - DEFAULT_OFFSET;

    style.top = `${top}px`;
    style.left = `${left}px`;
    style.maxHeight = `${Math.min(DEFAULT_MAX_HEIGHT, available)}px`;
  }
}
