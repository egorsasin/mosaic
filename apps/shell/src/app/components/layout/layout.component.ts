import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MosScrollComponent } from '@mosaic/ui/scroll';

import { showSidebarCart } from '../../store/cart/cart.actions';
import { selectActiveOrder } from '../../store';

@Component({
  selector: 'mos-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements AfterViewInit {
  @ViewChild(MosScrollComponent, { read: ElementRef })
  private readonly scrollBar?: ElementRef<HTMLElement>;

  private readonly destroyRef = inject(DestroyRef);

  public headerFixed = signal(false);

  public get scroll(): number {
    return this.scrollBar ? this.scrollBar.nativeElement.scrollTop : 0;
  }

  constructor(private store: Store, private elementRef: ElementRef) {
    if (!this.scrollBar) {
      return;
    }
  }

  public ngAfterViewInit() {
    if (!this.scrollBar) {
      return;
    }

    fromEvent(this.scrollBar.nativeElement, 'scroll')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() =>
        this.headerFixed.set(!!this.scrollBar?.nativeElement.scrollTop)
      );
  }

  protected onClick(): void {
    if (!this.scrollBar) {
      return;
    }

    const { nativeElement } = this.scrollBar;

    nativeElement.scrollTop =
      nativeElement.scrollTop < 100 ? nativeElement.scrollHeight : 0;
  }

  public order$ = this.store.select(selectActiveOrder);

  // Открыть корзину в сайдбаре
  public showCart(): void {
    this.store.dispatch(showSidebarCart());
  }
}
