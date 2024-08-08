import { ElementRef, inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  switchMap,
  take,
} from 'rxjs';

import { WINDOW } from '@mosaic/cdk/common';

export function mosIsElement(
  node?: Element | EventTarget | Node | null
): node is Element {
  return !!node && 'nodeType' in node && node.nodeType === Node.ELEMENT_NODE;
}

export function mosContainsOrAfter(current: Node, node: Node): boolean {
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

export function mosGetActualTarget(event: Event): Node {
  return event.composedPath()[0] as Node;
}

@Injectable()
export class MosDialogCloseService extends Observable<unknown> {
  private nativeElement = inject(ElementRef).nativeElement;
  private readonly window = inject(WINDOW);
  private readonly document = inject(DOCUMENT);

  private readonly esc$ = fromEvent(this.document, 'keydown').pipe(
    filter((event) => {
      const target = mosGetActualTarget(event);

      return (
        (event as KeyboardEvent).key === 'Escape' &&
        !event.defaultPrevented &&
        (this.nativeElement.contains(target) || this.isOutside(target))
      );
    })
  );

  private readonly mousedown$ = fromEvent(this.document, 'mousedown').pipe(
    filter((event) => this.isOutside(mosGetActualTarget(event))),
    switchMap(() =>
      fromEvent(this.document, 'mouseup').pipe(
        take(1),
        map(mosGetActualTarget),
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
      mosIsElement(target) &&
      (!mosContainsOrAfter(this.nativeElement, target) ||
        target === this.nativeElement)
    );
  }
}
