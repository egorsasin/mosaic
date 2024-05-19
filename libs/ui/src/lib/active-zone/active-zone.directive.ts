import {
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  Observable,
  share,
} from 'rxjs';
import {
  Directive,
  ElementRef,
  Inject,
  inject,
  InjectionToken,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';

import { WINDOW } from '@mosaic/cdk/common';

export const ACTIVE_ELEMENT = new InjectionToken<
  Observable<EventTarget | null>
>('Active element on the document', {
  factory: () => {
    const window = inject(WINDOW);
    return merge(
      fromEvent(window, 'pointerdown'),
      fromEvent(window, 'focusin')
    ).pipe(
      map((event: Event) => {
        return event.target;
      }),
      distinctUntilChanged(),
      share()
    );
  },
});

@Directive({
  selector: '[mosActiveZoneChange], [mosActiveZoneParent]',
  exportAs: `mosActiveZone`,
  standalone: true,
})
export class MosActiveZoneDirective implements OnDestroy {
  private subActiveZones: MosActiveZoneDirective[] = [];
  private parentZone: MosActiveZoneDirective | null = null;
  private directParent: MosActiveZoneDirective | null = inject(
    MosActiveZoneDirective,
    {
      skipSelf: true,
      optional: true,
    }
  );

  @Input() set mosActiveZoneParent(zone: MosActiveZoneDirective | null) {
    this.setZone(zone);
  }

  @Output() public readonly mosActiveZoneChange = this.activeElement.pipe(
    map((element) => {
      return !!element && this.contains(element);
    })
  );

  constructor(
    @Inject(ACTIVE_ELEMENT)
    private readonly activeElement: Observable<Element>,
    private elementRef: ElementRef
  ) {
    this.directParent?.addSubActiveZone(this);
  }

  public contains(node: Node): boolean {
    return (
      this.elementRef.nativeElement.contains(node) ||
      this.subActiveZones.some(
        (
          item: MosActiveZoneDirective,
          index: number,
          array: MosActiveZoneDirective[]
        ) => array.indexOf(item) === index && item.contains(node)
      )
    );
  }

  public ngOnDestroy(): void {
    this.directParent?.removeSubActiveZone(this);
    this.parentZone?.removeSubActiveZone(this);
  }

  private setZone(zone: MosActiveZoneDirective | null): void {
    if (this.parentZone) {
      this.parentZone.removeSubActiveZone(this);
    }

    if (zone) {
      zone.addSubActiveZone(this);
    }

    this.parentZone = zone;
  }

  private addSubActiveZone(activeZone: MosActiveZoneDirective): void {
    this.subActiveZones = [...this.subActiveZones, activeZone];
  }

  private removeSubActiveZone(activeZone: MosActiveZoneDirective): void {
    this.subActiveZones = this.subActiveZones.filter(
      (zone: MosActiveZoneDirective) => zone === activeZone
    );
  }
}
