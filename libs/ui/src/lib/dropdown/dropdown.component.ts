import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  HostBinding,
  HostListener,
  Inject,
  Injector,
  INJECTOR,
  Input,
  TemplateRef,
} from '@angular/core';

import { DATA_LIST_HOST } from '../tokens';
import { DataListHost } from '../types';

@Component({
  selector: 'mos-dropdown',
  exportAs: 'mosDropdownComponent',
  templateUrl: './dropdown.component.html',
  styles: [':host {display: inline-block;}'],
  providers: [
    {
      provide: DATA_LIST_HOST,
      useExisting: forwardRef(() => MosDropdownComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosDropdownComponent<T> implements DataListHost<T> {
  @Input() content!: TemplateRef<T>;

  @HostBinding('class.mos-open')
  public isVisible = false;

  constructor(
    @Inject(INJECTOR) public readonly injector: Injector,
    private chandeDetectorRef: ChangeDetectorRef
  ) {}

  public handleOption(option?: T | undefined): void {
    this.updateOpen(false);
    this.chandeDetectorRef.markForCheck();
  }

  @HostListener('click')
  public onClick() {
    this.isVisible = !this.isVisible;
  }

  public onActiveZone(active: boolean) {
    if (!active) {
      this.updateOpen(false);
    }
  }

  public updateOpen(open: boolean): void {
    this.isVisible = open;
  }
}
