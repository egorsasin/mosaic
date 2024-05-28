/* eslint-disable @angular-eslint/no-host-metadata-property */
import {
  Directive,
  ElementRef,
  forwardRef,
  Input,
  Inject,
  OnChanges,
  Optional,
  Provider,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  COMPOSITION_BUFFER_MODE,
} from '@angular/forms';
import { createTextMaskInputElement } from './create-element';
import { WINDOW } from '@mosaic/cdk';

export class TextMaskConfig {
  mask?:
    | Array<string | RegExp>
    | ((raw: string) => Array<string | RegExp>)
    | false;
  guide?: boolean;
  placeholderChar?: string;
  pipe?: (
    conformedValue: string,
    config: TextMaskConfig
  ) => false | string | object;
  keepCharPositions?: boolean;
  showMask?: boolean;
}

export const MASKEDINPUT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MosMaskDirective),
  multi: true,
};

@Directive({
  host: {
    '(input)': '_handleInput($event.target.value)',
    '(blur)': 'onTouched()',
    '(compositionstart)': '_compositionStart()',
    '(compositionend)': '_compositionEnd($event.target.value)',
  },
  selector: '[mosMask]',
  exportAs: 'mosMask',
  providers: [MASKEDINPUT_VALUE_ACCESSOR],
})
export class MosMaskDirective implements ControlValueAccessor, OnChanges {
  private textMaskInputElement: any;
  private inputElement?: HTMLInputElement;

  /** Whether the user is creating a composition string (IME events). */
  private _composing = false;

  @Input('mosMask') maskConfig: TextMaskConfig = {
    mask: [],
    guide: true,
    placeholderChar: '_',
    pipe: undefined,
    keepCharPositions: false,
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched = () => {};

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    @Optional()
    @Inject(COMPOSITION_BUFFER_MODE)
    private compositionMode: boolean,
    @Inject(WINDOW) window: Window
  ) {
    if (this.compositionMode == null) {
      /**
       * We must check whether the agent is Android because composition events
       * behave differently between iOS and Android.
       */
      const userAgent = window.navigator.userAgent || window.navigator.vendor;
      this.compositionMode = /android (\d+)/.test(userAgent.toLowerCase());
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.setupMask(true);
    if (this.textMaskInputElement !== undefined) {
      this.textMaskInputElement.update(this.inputElement?.value);
    }
  }

  writeValue(value: any) {
    this.setupMask();

    // set the initial value for cases where the mask is disabled
    const normalizedValue = value == null ? '' : value;
    this._renderer.setProperty(this.inputElement, 'value', normalizedValue);

    if (this.textMaskInputElement !== undefined) {
      this.textMaskInputElement.update(value);
    }
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(
      this._elementRef.nativeElement,
      'disabled',
      isDisabled
    );
  }

  _handleInput(value: string) {
    if (!this.compositionMode || (this.compositionMode && !this._composing)) {
      this.setupMask();

      if (this.textMaskInputElement !== undefined) {
        this.textMaskInputElement.update(value);

        // get the updated value
        value = this.inputElement?.value || '';
        this.onChange(value);
      }
    }
  }

  private setupMask(create = false): void {
    if (!this.inputElement) {
      if (this._elementRef.nativeElement.tagName.toUpperCase() === 'INPUT') {
        // `textMask` directive is used directly on an input element
        this.inputElement = this._elementRef.nativeElement;
      } else {
        // `textMask` directive is used on an abstracted input element, `md-input-container`, etc
        this.inputElement =
          this._elementRef.nativeElement.getElementsByTagName('INPUT')[0];
      }
    }

    if (this.inputElement && create) {
      this.textMaskInputElement = createTextMaskInputElement(
        Object.assign({ inputElement: this.inputElement }, this.maskConfig)
      );
    }
  }

  _compositionStart(): void {
    this._composing = true;
  }

  _compositionEnd(value: any): void {
    this._composing = false;
    this.compositionMode && this._handleInput(value);
  }
}
