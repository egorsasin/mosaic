import {
  ContentChildren,
  Directive,
  ElementRef,
  HostListener,
  QueryList,
} from '@angular/core';

import { MosDropdownOptionDirective } from './dropdown-option.directive';

@Directive({
  selector: '[mosDropdownList]',
})
export class MosDropdownListDirective {
  private origin?: HTMLElement;

  @ContentChildren(MosDropdownOptionDirective, { descendants: true })
  options?: QueryList<MosDropdownOptionDirective<unknown>>;

  constructor() {}

  @HostListener('focusin', ['$event.relatedTarget', '$event.currentTarget'])
  public onFocusIn(
    relatedTarget: HTMLElement,
    currentTarget: HTMLElement
  ): void {
    if (!currentTarget.contains(relatedTarget) && !this.origin) {
      this.origin = relatedTarget;
    }
  }

  @HostListener('wheel.silent.passive')
  @HostListener('mouseleave', ['$event.target'])
  public handleFocusLossIfNecessary(): void {
    if (this.origin) {
      this.origin.focus();
    }
  }

  @HostListener('keydown.arrowDown', ['$event', '1'])
  @HostListener('keydown.arrowUp', ['$event', '-1'])
  public onKeyDownArrow(event: KeyboardEvent, step: number): void {
    event.preventDefault();

    const current = event.target;

    const index = this.options
      ?.toArray()
      .findIndex(
        ({ nativeElement }: MosDropdownOptionDirective<unknown>) =>
          nativeElement === current
      );

    this.options?.get((index || 0) + step)?.nativeElement.focus();
  }
}
