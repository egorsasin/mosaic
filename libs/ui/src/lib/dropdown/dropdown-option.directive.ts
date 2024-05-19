import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  Output,
} from '@angular/core';

import { DATA_LIST_HOST } from '../tokens';
import { DataListHost } from '../types';

@Directive({
  selector: 'button[mosDropdownOption]',
})
export class MosDropdownOptionDirective<T> {
  @Input()
  public disabled?: boolean;

  @Input()
  public mosDropdownOption?: T;

  @Output() public dropdownSelect = new EventEmitter<void>();

  public get nativeElement() {
    return this.elementRef.nativeElement;
  }

  constructor(
    @Inject(DATA_LIST_HOST) private readonly host: DataListHost<T>,
    private elementRef: ElementRef
  ) {}

  @HostListener('click')
  public onClick(): void {
    if (!this.disabled) {
      this.host.handleOption(this.mosDropdownOption);
      this.dropdownSelect.emit();
    }
  }

  @HostListener('mousemove')
  public onMouseMove(): void {
    this.nativeElement.focus({ preventScroll: true });
  }
}
