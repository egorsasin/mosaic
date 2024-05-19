import { Directive, ElementRef, Inject } from '@angular/core';

import { MosPoint, PositionAccessor } from '../types';

import { MosDropdownDirective } from './dropdown.directive';
import { WINDOW } from '@mosaic/cdk';

const rect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
} as const;

export const EMPTY_CLIENT_RECT: DOMRect = {
  ...rect,
  toJSON() {
    return rect;
  },
};

export const MOS_DROPDOWN_DEFAULT_OPTIONS = {
  align: 'left',
  direction: null,
  limitWidth: 'auto',
  maxHeight: 400,
  minHeight: 80,
  offset: 4,
};

type VerticalAlignment = 'bottom' | 'top';

@Directive({
  selector: '[mosDropdown]',
  providers: [
    { provide: PositionAccessor, useExisting: MosDropdownPositionDirective },
  ],
})
export class MosDropdownPositionDirective implements PositionAccessor {
  private previous?: VerticalAlignment;

  constructor(
    private clientRectAccessor: MosDropdownDirective,
    private elementRef: ElementRef,
    @Inject(WINDOW) private window: Window
  ) {}

  public get clientRect(): DOMRect {
    return this.elementRef.nativeElement.getBoundingClientRect();
  }

  public getPosition({ width, height }: DOMRect): MosPoint {
    const hostRect =
      this.clientRectAccessor?.getClientRect() ?? EMPTY_CLIENT_RECT;

    const { minHeight, align, direction, offset } =
      MOS_DROPDOWN_DEFAULT_OPTIONS;
    const previous = this.previous || direction || 'bottom';
    const right = Math.max(hostRect.right - width, offset);
    const available = {
      top: hostRect.top - 2 * offset,
      bottom: this.window.innerHeight - hostRect.bottom - 2 * offset,
    } as const;
    const position: Record<string, number> = {
      top: hostRect.top - offset - height,
      bottom: hostRect.bottom + offset,
      right,
      center:
        hostRect.left + hostRect.width / 2 + width / 2 <
        this.window.innerWidth - offset
          ? hostRect.left + hostRect.width / 2 - width / 2
          : right,
      left:
        hostRect.left + width < this.window.innerWidth - offset
          ? hostRect.left
          : right,
    } as const;
    const better: VerticalAlignment =
      available.top > available.bottom ? 'top' : 'bottom';

    if (
      (available[previous] > minHeight && direction) ||
      available[previous] > height
    ) {
      return { top: position[previous], left: position[align] };
    }

    this.previous = better;

    return { top: position[better], left: position[align] };
  }
}
