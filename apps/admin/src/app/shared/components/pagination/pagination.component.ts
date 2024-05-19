import { QueryList } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChildren,
} from '@angular/core';
import { of } from 'rxjs';

import { clamp } from '@mosaic/cdk';

const DOTS_LENGTH = 1;
const ACTIVE_ITEM_LENGTH = 1;

export function horizontalDirectionToNumber(
  direction: 'left' | 'right'
): -1 | 1 {
  switch (direction) {
    case 'left':
      return -1;
    case 'right':
      return 1;
  }
}

@Component({
  selector: 'mosaic-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosPaginationComponent {
  @ViewChildren('element', { read: ElementRef })
  private readonly elements: QueryList<ElementRef<HTMLElement>> = new QueryList<
    ElementRef<HTMLElement>
  >();

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  @Input()
  public length = 1;

  @Input()
  public focusable = true;

  @Input()
  public size: 's' | 'l' = 'l';

  @Input()
  public readonly disabled = false;

  /**
   * Amount of visible pages around active page
   */
  @Input()
  public activePadding = 1;

  /**
   * Amount of visible pages at the edges
   */
  @Input()
  public sidePadding = 1;

  /**
   * Customization for page number display.
   */
  @Input()
  public content: any; //PolymorpheusContent<TuiContext<number>>;

  /**
   * Active page index
   */
  @Input()
  public index = 0;

  @Output()
  public readonly indexChange = new EventEmitter<number>();

  protected readonly texts$ = of(['1', '2', '3']); // inject(TUI_PAGINATION_TEXTS);
  protected readonly icons = of([]); // inject(TUI_SPIN_ICONS);

  public get focused(): boolean {
    return false; //tuiIsNativeFocusedIn(this.el);
  }

  public get arrowIsDisabledLeft(): boolean {
    return this.index === 0;
  }

  public get arrowIsDisabledRight(): boolean {
    return this.reverseIndex === 0;
  }

  /**
   * Number of items in a container.
   */
  protected get elementsLength(): number {
    return this.itemsFit ? this.length : this.maxElementsLength;
  }

  protected elementIsFocusable(index: number): boolean {
    return this.index === index && !this.focused;
  }

  /**
   * Get index by element index
   * @param elementIndex
   * @returns index or null (for '…')
   */
  protected getItemIndexByElementIndex(elementIndex: number): number | null {
    if (this.size === 's') {
      return elementIndex;
    }

    if (elementIndex < this.sidePadding) {
      return elementIndex;
    }

    if (
      elementIndex === this.sidePadding &&
      this.hasCollapsedItems(this.index)
    ) {
      return null;
    }

    const reverseElementIndex = this.lastElementIndex - elementIndex;

    if (
      reverseElementIndex === this.sidePadding &&
      this.hasCollapsedItems(this.reverseIndex)
    ) {
      return null;
    }

    if (reverseElementIndex < this.sidePadding) {
      return this.lastIndex - reverseElementIndex;
    }

    const computedIndex = this.index - this.maxHalfLength + elementIndex;

    return clamp(
      computedIndex,
      elementIndex,
      this.lastIndex - reverseElementIndex
    );
  }

  protected getElementMode(index: number): string {
    const fallback = this.size === 's' ? 'secondary' : 'flat';

    return this.index === index ? 'primary' : fallback;
  }

  protected onElementClick(index: number): void {
    this.updateIndex(index);
  }

  protected onElementKeyDownArrowLeft(element: HTMLElement): void {
    if (element === this.elements.first.nativeElement) {
      return;
    }

    const previous = this.elements.find(
      (_, index, array) => array[index + 1].nativeElement === element
    );

    previous?.nativeElement.focus();
  }

  protected onElementKeyDownArrowRight(element: HTMLElement): void {
    if (element === this.elements.last.nativeElement) {
      return;
    }

    const next = this.elements.find(
      (_, index, array) => array[index - 1]?.nativeElement === element
    );

    next?.nativeElement.focus();
  }

  protected onArrowClick(direction: any): void {
    this.tryChangeTo(direction);
    this.focusActive();
  }

  /**
   * Active index from the end
   */
  private get reverseIndex(): number {
    return this.lastIndex - this.index;
  }

  private get maxHalfLength(): number {
    return this.sidePadding + DOTS_LENGTH + this.activePadding;
  }

  private get itemsFit(): boolean {
    return this.length <= this.maxElementsLength;
  }

  private get maxElementsLength(): number {
    return this.maxHalfLength * 2 + ACTIVE_ITEM_LENGTH;
  }

  private get lastIndex(): number {
    return this.length - 1;
  }

  private get lastElementIndex(): number {
    return this.elementsLength - 1;
  }

  /**
   * Are there collapsed items at that index
   * @param index
   * @returns there are collapsed items
   */
  private hasCollapsedItems(index: number): boolean {
    return !this.itemsFit && index > this.maxHalfLength;
  }

  private tryChangeTo(direction: 'left' | 'right'): void {
    this.updateIndex(
      clamp(
        this.index + horizontalDirectionToNumber(direction),
        0,
        this.lastIndex
      )
    );
  }

  private focusActive(): void {
    // const { nativeFocusableElement } = this;
    // if (nativeFocusableElement) {
    //   nativeFocusableElement.focus();
    // }
  }

  private updateIndex(index: number): void {
    if (this.index === index) {
      return;
    }

    this.index = index;
    this.indexChange.emit(index);
  }
}
