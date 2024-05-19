import {
  ComponentRef,
  Directive,
  ElementRef,
  Inject,
  INJECTOR,
  Input,
  OnChanges,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import {
  delay,
  filter,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

import { ContextWrapper } from '@mosaic/cdk/common';

import { OverlayHostService } from '../overlay-host';
import { ClientRectAccessor } from '../types';

import { HintComponent } from './hint.component';
import { HoveredService } from './hovered.service';
import { MOSAIC_HINT_COMPONENT } from './tokens';

@Directive({
  selector: '[mosHint]:not(ng-container)',
  providers: [
    HoveredService,
    {
      provide: ContextWrapper,
      deps: [MOSAIC_HINT_COMPONENT, INJECTOR],
      useClass: ContextWrapper,
    },
    { provide: ClientRectAccessor, useExisting: HintDirective },
  ],
})
export class HintDirective<T>
  implements OnDestroy, OnChanges, ClientRectAccessor
{
  private destroy$: Subject<void> = new Subject<void>();
  private toggle$: Subject<boolean> = new Subject<boolean>();
  private componentRef: ComponentRef<HintComponent<T>> | null = null;

  @Input('mosHint')
  content: TemplateRef<T> | null = null;

  constructor(
    @Inject(HoveredService) private readonly hovered$: Observable<boolean>,
    private readonly elementRef: ElementRef<HTMLElement>,
    private overlayHostService: OverlayHostService,
    private contextWrapper: ContextWrapper<HintComponent<T>>
  ) {
    merge(this.hovered$, this.toggle$)
      .pipe(
        filter(() => !!this.content),
        switchMap((show: boolean) => of(show).pipe(delay(show ? 50 : 200))),
        takeUntil(this.destroy$)
      )
      .subscribe((show: boolean) => this.show(show));
  }

  public ngOnChanges(): void {
    if (!this.content) {
      this.toggle(false);
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.show(false);
  }

  public toggle(show: boolean): void {
    return this.toggle$.next(show);
  }

  public getClientRect(): DOMRect {
    return this.elementRef.nativeElement.getBoundingClientRect();
  }

  private show(show: boolean): void {
    if (show && !this.componentRef) {
      this.componentRef = this.overlayHostService.add(this.contextWrapper);
      const hintInstance = this.componentRef.instance;

      hintInstance.templateRef = this.content;
    } else if (!show && this.componentRef) {
      this.overlayHostService.remove(this.componentRef);
      this.componentRef = null;
    }
  }
}
