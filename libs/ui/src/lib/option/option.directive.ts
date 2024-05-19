import { distinctUntilChanged, EMPTY, map, startWith, tap } from 'rxjs';
import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Inject,
  Input,
  Optional,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import { DataListHost, IdentityMatcher } from '../types';
import { defaultIdentityMatcher } from '../utils';
import { DATA_LIST_HOST } from '../tokens';

@Directive({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[mosSelectOption], a[mosSelectOption]',
  standalone: true,
})
export class MosOptionDirective<T> {
  @Input()
  mosSelectOption?: T;

  @HostBinding('[class.active]')
  public readonly selected$ = this.control
    ? this.control?.valueChanges?.pipe(
        startWith(null),
        map(() => this.selected),
        tap((selected: boolean) => {
          if (selected) {
            this.nativeElement.classList.add('active');
          } else {
            this.nativeElement.classList.remove('active');
          }
        }),
        distinctUntilChanged()
      )
    : EMPTY;

  private get selected(): boolean {
    return (
      this.mosSelectOption &&
      this.control?.value?.length &&
      this.control?.value?.find((value: T) =>
        this.matcher(value, this.mosSelectOption as T)
      )
    );
  }

  private get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  private get matcher(): IdentityMatcher<T> {
    return this.host.identityMatcher || defaultIdentityMatcher;
  }

  constructor(
    @Inject(DATA_LIST_HOST)
    private readonly host: DataListHost<T>,
    @Inject(NgControl) @Optional() protected readonly control: NgControl,
    private elementRef: ElementRef
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();

    if (this.mosSelectOption !== 'undefined') {
      this.host.handleOption(this.mosSelectOption);
    }
  }
}
