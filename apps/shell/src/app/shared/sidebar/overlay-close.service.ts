import { DOCUMENT } from '@angular/common';
import { ElementRef, inject, Injectable } from '@angular/core';

import { WINDOW } from '@mosaic/cdk';

import {
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  switchMap,
  take,
} from 'rxjs';

const SCROLLBAR_PLACEHOLDER = 17;

const getActualTarget = (event: Event) => event.composedPath()[0];

function isElement(
  node?: Element | EventTarget | Node | null
): node is Element {
  return !!node && 'nodeType' in node && node.nodeType === Node.ELEMENT_NODE;
}

function containsOrAfter(current: Node, node: Node): boolean {
  try {
    return (
      current.contains(node) ||
      !!(
        node.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_PRECEDING
      )
    );
  } catch {
    return false;
  }
}

@Injectable()
export class MosOverlayCloseService extends Observable<unknown> {
  private readonly window = inject(WINDOW);
  private readonly document = inject(DOCUMENT);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  private readonly esc$ = fromEvent(this.document, 'keydown').pipe(
    filter((event: Event) => {
      const target: EventTarget = getActualTarget(event);

      return (
        (event as KeyboardEvent).key === 'Escape' &&
        !event.defaultPrevented &&
        (this.el.contains(target as HTMLElement) || this.isOutside(target))
      );
    })
  );

  private readonly mousedown$ = fromEvent(this.document, 'mousedown').pipe(
    filter((event) => {
      const viewportWidth = Math.max(
        this.document.documentElement.clientWidth || 0,
        this.window.innerWidth || 0
      );
      return (
        viewportWidth - (event as MouseEvent).clientX > SCROLLBAR_PLACEHOLDER &&
        this.isOutside(getActualTarget(event))
      );
    }),
    switchMap(() =>
      fromEvent(this.document, 'mouseup').pipe(
        take(1),
        map(getActualTarget),
        filter((target) => this.isOutside(target))
      )
    )
  );

  constructor() {
    super((subscriber) =>
      merge(this.esc$, this.mousedown$).subscribe(subscriber)
    );
  }

  private isOutside(target: EventTarget): boolean {
    return (
      isElement(target) &&
      (!containsOrAfter(this.el, target) || target === this.el)
    );
  }
}
