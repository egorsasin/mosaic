import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Optional,
} from '@angular/core';
import { MosScrollComponent } from '../scroll/scroll.component';
import {
  Observable,
  distinctUntilChanged,
  map,
  startWith,
  throttleTime,
} from 'rxjs';
import { ANIMATION_FRAME } from '@mosaic/cdk';

@Component({
  selector: 'mos-scrollbar',
  templateUrl: './scrollbar.component.html',
  styleUrls: ['./scrollbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class MosScrollbarComponent {
  readonly refresh$ = this.animationFrame.pipe(
    throttleTime(300),
    map(() => this.scrollbars),
    startWith({ vertical: false, horizontal: false }),
    distinctUntilChanged(
      (prev, curr) =>
        prev.vertical === curr.vertical && prev.horizontal === curr.horizontal
    )
  );

  private get scrollContainer() {
    return this.scroll.browserScrollRef
      ? this.scroll.browserScrollRef.nativeElement
      : this.doc.documentElement;
  }

  constructor(
    @Inject(ANIMATION_FRAME) private readonly animationFrame: Observable<void>,
    @Inject(DOCUMENT) private readonly doc: Document,
    @Optional()
    private readonly scroll: MosScrollComponent
  ) {}

  private get scrollbars(): { vertical: boolean; horizontal: boolean } {
    const { clientHeight, scrollHeight, clientWidth, scrollWidth } =
      this.scrollContainer;

    return {
      vertical: Math.ceil((clientHeight / scrollHeight) * 100) < 100,
      horizontal: Math.ceil((clientWidth / scrollWidth) * 100) < 100,
    };
  }
}
