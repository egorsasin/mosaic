import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { fromEvent, repeat, Subject, takeUntil, timer } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

import { MOSAIC_CONTEXT, MosPopover } from '@mosaic/cdk';

import { MosAlertOptions } from '../../alert.types';

export const heightCollapseAnimation = trigger('tuiHeightCollapse', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate(
      '200ms ease-in',
      style({ opacity: '*', transform: 'translateX(0)' })
    ),
  ]),
  transition(':leave', [
    style({ transform: 'translateX(0)' }),
    animate(
      '200ms ease-in',
      style({ opacity: '*', transform: 'translateX(100%)' })
    ),
  ]),
]);

@Component({
  selector: 'mos-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [heightCollapseAnimation],
})
export class MosAlertComponent implements OnInit, OnDestroy {
  protected item = inject<MosPopover<MosAlertOptions, unknown>>(MOSAIC_CONTEXT);
  protected readonly autoClose: any = this.item.autoClose;
  protected destroy$: Subject<void> = new Subject<void>();
  protected nativeElement = this.elementRef.nativeElement;

  @HostBinding('@tuiHeightCollapse') protected animate = true;

  constructor(private elementRef: ElementRef) {}

  public ngOnInit(): void {
    this.initAutoClose();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected close(): void {
    this.item.$implicit.complete();
  }

  private initAutoClose(): void {
    timer(this.autoClose)
      .pipe(
        takeUntil(fromEvent(this.nativeElement, 'mouseenter')),
        repeat({ delay: () => fromEvent(this.nativeElement, 'mouseleave') }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.close());
  }
}
