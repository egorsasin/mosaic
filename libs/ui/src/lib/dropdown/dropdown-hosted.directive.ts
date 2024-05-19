import { Directive, HostListener, Inject, Input } from '@angular/core';

import { MosDropdownListDirective } from './dropdown-list.directive';
import { DATA_LIST_HOST } from '../tokens';
import { DataListHost } from '../types';

@Directive({
  selector: `[mosDropdown][mosHosted]`,
})
export class MosDropdownHostedDirective<T> {
  @Input() mosHosted?: MosDropdownListDirective | null;

  constructor(@Inject(DATA_LIST_HOST) private readonly host: DataListHost<T>) {}

  @HostListener('document:keydown.escape', ['$event'])
  public onKeyDownEsc(event: Event): void {
    event.stopPropagation();
    this.host.updateOpen(false);
  }

  @HostListener('keydown.arrowdown', ['$event'])
  public onArrowDown(event: KeyboardEvent) {
    event.preventDefault();
    const { options } = this.mosHosted || {};
    if (options?.length) {
      const current = options.first;
      current.nativeElement.focus();
    }
  }
}
