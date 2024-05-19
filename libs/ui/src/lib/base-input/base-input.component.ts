import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

function getNativeFocused(documentRef: Document): Element | null {
  if (!documentRef.activeElement?.shadowRoot) {
    return documentRef.activeElement;
  }

  let element = documentRef.activeElement.shadowRoot.activeElement;

  while (element?.shadowRoot) {
    element = element.shadowRoot.activeElement;
  }

  return element;
}

@Component({
  selector: 'mos-base-input',
  templateUrl: './base-input.component.html',
  styleUrls: ['./base-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosBaseInputComponent {
  @ViewChild('input', { static: true, read: ElementRef })
  public inputElement?: ElementRef<HTMLInputElement>;

  @HostBinding(`class.mos-disabled`)
  @Input()
  public disabled = false;

  @Input()
  public placeholder = '';

  @Input()
  public value = '';

  @Input()
  public cleaner = true;

  @Input()
  public copier = false;

  @Input() public readonly = false;

  @Input() public pseudoFocused?: boolean;

  @Output()
  public readonly valueChange = new EventEmitter<string>();

  @Output()
  public readonly clear = new EventEmitter<void>();

  @Output()
  public readonly focusChanged = new EventEmitter<boolean>();

  // Эти события слушать обязательно для корректного отслеживания focused
  @HostListener('focusin', ['true'])
  @HostListener('focusout', ['false'])
  public onFocused(focused: boolean) {
    this.focusChanged.emit(focused);
  }

  @HostBinding(`class.mos-focused`)
  public get focused(): boolean {
    const node = this.elementRef.nativeElement;
    const documentRef = node.ownerDocument;

    const element = getNativeFocused(documentRef);
    return (!!element && node.contains(element)) || this.pseudoFocused;
  }

  private get hasValue(): boolean {
    return !(
      this.value === null ||
      this.value === undefined ||
      this.value.toString().trim() === ''
    );
  }

  get hasCopy(): boolean {
    return this.hasValue && this.copier;
  }

  constructor(private elementRef: ElementRef) {}

  public onClear(): void {
    this.updateValue('');
    this.clear.emit();
  }

  public onModelChange(value: string): void {
    this.updateValue(value);
  }

  private updateValue(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
  }
}
