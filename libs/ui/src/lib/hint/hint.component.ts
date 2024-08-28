import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  OnDestroy,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';

import { MosPoint, ClientRectAccessor } from '../types';

import { HintPositionService } from './hint-position.service';
import { hintAnimation } from './hint.animation';
import { HintDirective } from './hint.directive';
import { HoveredService } from './hovered.service';

@Component({
  selector: 'mos-hint',
  template: '<ng-container *ngTemplateOutlet="templateRef"></ng-container>',
  styleUrls: ['./hint.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [HoveredService, HintPositionService],
  encapsulation: ViewEncapsulation.None,
  animations: [hintAnimation],
})
export class HintComponent<T> implements OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  @HostBinding('@hintAnimation')
  public readonly animation = { value: '' } as const;

  @HostBinding('attr.data-appearance')
  public appearance?: string = this.hintDirective.appearance;

  public templateRef: TemplateRef<T> | null = null;

  constructor(
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly elementRef: ElementRef,
    private clientRectAccessor: ClientRectAccessor,
    private hintDirective: HintDirective<T>,
    hintPositionService: HintPositionService,
    @Inject(HoveredService) hovered$: Observable<boolean>
  ) {
    hintPositionService
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: MosPoint) => this.updatePosition(value));

    hovered$.pipe(takeUntil(this.destroy$)).subscribe((show: boolean) => {
      this.hintDirective.toggle(show);
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePosition({ top: hostTop, left: hostLeft }: MosPoint) {
    const { nativeElement } = this.elementRef;
    const { height: hostHeight, width: hostWidth } =
      nativeElement.getBoundingClientRect();
    const { style } = nativeElement;

    const { top, left, height, width } =
      this.clientRectAccessor.getClientRect();
    const safeLeft = Math.max(hostLeft, 4);
    const beakTop = top + height / 2 - hostTop;
    const beakLeft = left + width / 2 - safeLeft;

    // Rotate beacon accordinly position
    let rotate = 45;
    if (left > hostLeft + hostWidth) {
      rotate = 135;
    } else if (hostLeft > left + width) {
      rotate = -45;
    } else if (top > hostTop + hostHeight) {
      rotate = 225;
    }

    style.top = `${hostTop}px`;
    style.left = `${hostLeft}px`;

    style.setProperty('--top', `${this.clamp(beakTop, 0, hostHeight - 1)}px`);
    style.setProperty('--left', `${this.clamp(beakLeft, 0, hostWidth - 1)}px`);
    style.setProperty('--rotate', `${rotate}deg`);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
