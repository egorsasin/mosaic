import { Directive, Inject, Input } from '@angular/core';

import { WINDOW } from '@mosaic/cdk/common';

import { MosPoint, PositionAccessor } from '../types';

import { HintDirective } from './hint.directive';
import { HintDirection, HINT_DIRECTIONS } from './types';

const OFFSET = 8;
const ARROW_OFFSET = 25;

@Directive({
  selector: '[mosHint]',
  providers: [
    { provide: PositionAccessor, useExisting: HintPositionDirective },
  ],
})
export class HintPositionDirective implements PositionAccessor {
  private readonly points: Record<HintDirection, MosPoint> =
    HINT_DIRECTIONS.reduce(
      (acc, direction) => ({ ...acc, [direction]: { top: 0, left: 0 } }),
      {} as Record<HintDirection, MosPoint>
    );

  @Input() public direction: HintDirection = 'top-left';

  private get fallback(): HintDirection {
    return this.points['top'].top >
      this.window.innerHeight - this.points['bottom'].top
      ? 'top'
      : 'bottom';
  }

  constructor(
    private clientRectAccessor: HintDirective<unknown>,
    @Inject(WINDOW) private window: Window
  ) {}

  public getPosition({ width, height }: DOMRect): MosPoint {
    /* Dimensions of the hint directive container */
    const directiveRect: DOMRect = this.clientRectAccessor.getClientRect();

    const offset =
      directiveRect.width / 2 > ARROW_OFFSET
        ? directiveRect.width / 2
        : ARROW_OFFSET;

    const leftCenter = directiveRect.left + directiveRect.width / 2;
    const topCenter = directiveRect.top + directiveRect.height / 2;

    this.points['top-left'].top = directiveRect.top - height - OFFSET;
    this.points['top-left'].left = leftCenter - width + ARROW_OFFSET;

    this.points['top'].top = this.points['top-left'].top;
    this.points['top'].left = leftCenter - width / 2;

    this.points['top-right'].top = this.points['top-left'].top;
    this.points['top-right'].left = leftCenter - width + offset;

    this.points['bottom-left'].top = directiveRect.bottom + OFFSET;
    this.points['bottom-left'].left = this.points['top-left'].left;

    this.points['bottom'].top = this.points['bottom-left'].top;
    this.points['bottom'].left = this.points['top'].left;

    this.points['bottom-right'].top = this.points['bottom-left'].top;
    this.points['bottom-right'].left = this.points['top-right'].left;

    this.points['left-top'].top = topCenter - height + ARROW_OFFSET;
    this.points['left-top'].left = directiveRect.left - width - OFFSET;

    this.points['left'].top = topCenter - height / 2;
    this.points['left'].left = this.points['left-top'].left;

    this.points['left-bottom'].top = topCenter - ARROW_OFFSET;
    this.points['left-bottom'].left = this.points['left-top'].left;

    this.points['right-top'].top = this.points['left-top'].top;
    this.points['right-top'].left = directiveRect.right + OFFSET;

    this.points['right'].top = this.points.left.top;
    this.points['right'].left = this.points['right-top'].left;

    this.points['right-bottom'].top = this.points['left-bottom'].top;
    this.points['right-bottom'].left = this.points['right-top'].left;

    if (this.checkPosition(this.points[this.direction], width, height)) {
      return this.points[this.direction];
    }

    const direction = HINT_DIRECTIONS.find((direction) =>
      this.checkPosition(this.points[direction], width, height)
    );

    return this.points[direction || this.fallback];
  }

  private checkPosition(
    { top, left }: MosPoint,
    width: number,
    height: number
  ): boolean {
    return (
      top > OFFSET &&
      left > OFFSET &&
      top + height < this.window.innerHeight - OFFSET &&
      left + width < this.window.innerWidth - OFFSET
    );
  }
}
