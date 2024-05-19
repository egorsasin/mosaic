import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  Optional,
  Output,
  Self,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import { MosAbstractNullableControl } from '@mosaic/cdk';

import { DataListHost, IdentityMatcher, StringHandler } from '../types';
import { DATA_LIST_HOST } from '../tokens';
import { MosDropdownDirective } from '../dropdown';
import { MosBaseInputComponent } from '../base-input';
import {
  defaultIdentityMatcher,
  defaultStringHandler,
  getNativeFocused,
} from '../utils';

@Component({
  selector: 'mos-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DATA_LIST_HOST,
      useExisting: forwardRef(() => MosSelectComponent),
    },
  ],
})
export class MosSelectComponent<T>
  extends MosAbstractNullableControl<T>
  implements DataListHost<T>
{
  protected localIsVisible = false;

  @ViewChild(MosDropdownDirective)
  private dropdownContainer!: MosDropdownDirective;

  @ViewChild(MosBaseInputComponent, { static: true })
  public readonly textfield?: MosBaseInputComponent;

  @Input() public placeholder = '';

  @Input()
  public hasCleaner = true;

  @Input()
  public customContent: TemplateRef<unknown> | null = null;

  @Input()
  public stringify: StringHandler<T> = defaultStringHandler;

  @Input()
  public identityMatcher: IdentityMatcher<T> = defaultIdentityMatcher;

  @Output()
  public readonly searchChange = new EventEmitter<string>();
  public search = '';

  @Output()
  public readonly focusChanged = new EventEmitter<boolean>();

  @HostListener('click')
  public onClick() {
    this.toggleDropdown();
  }

  // Эти события слушать обязательно для корректного отслеживания focused
  @HostListener('focusin', ['true'])
  @HostListener('focusout', ['false'])
  public onFocused(focused: boolean) {
    this.focusChanged.emit(focused);
  }

  @HostBinding(`class.focused`)
  public get focused(): boolean {
    const node = this.elementRef.nativeElement;
    const documentRef = node.ownerDocument;

    const element = getNativeFocused(documentRef);
    return (!!element && node.contains(element)) || this.isVisible;
  }

  @Input()
  public readonly = false;

  @HostBinding(`class.mos-disabled`)
  @Input()
  public controlDisabled = false;

  public set isVisible(val: boolean) {
    this.localIsVisible = val;
  }

  public get isVisible(): boolean {
    return this.localIsVisible;
  }

  public get computedValue(): string {
    return this.value === null ? `` : this.stringify(this.value) || ` `;
  }

  public get hasValue(): boolean {
    return !!this.value;
  }

  public get labelRaised(): boolean {
    return this.focused || this.hasValue;
  }

  get cleaner(): boolean {
    return this.hasValue && this.hasCleaner;
  }

  constructor(
    @Self() @Optional() ngControl: NgControl,
    protected elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(ngControl, changeDetectorRef);
  }

  public stringified(value: T): string {
    return this.stringify(value);
  }

  public clear(): void {
    this.updateValue(null);
  }

  public handleOption(option: T): void {
    this.updateValue(option);
    this.focusInput();
    this.updateOpen(false);
  }

  public onActiveZone(active: boolean) {
    if (!active && this.isVisible) {
      this.updateOpen(false);
    }
  }

  public toggleDropdown() {
    if (!this.disabled) {
      this.updateOpen(!this.isVisible);
    }
  }

  private focusInput(preventScroll = false): void {
    if (this.textfield?.inputElement?.nativeElement) {
      this.textfield?.inputElement?.nativeElement.focus({ preventScroll });
    }
  }

  public updateOpen(open: boolean): void {
    this.isVisible = open;
  }
}
