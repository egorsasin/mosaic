import { ChangeDetectorRef, Directive, HostBinding } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

const EMPTY_FUNCTION = () => {
  /* EMPTY_FUNCTION */
};

@Directive()
export abstract class MosAbstractControl<T> implements ControlValueAccessor {
  protected onChange: (value?: T) => void = EMPTY_FUNCTION;
  protected onTouched = EMPTY_FUNCTION;

  private previousValue?: T | null;
  private invalidInternal = false;

  protected readonly fallbackValue = this.getFallbackValue();

  @HostBinding('class.mos-invalid')
  public get computedInvalid(): boolean {
    const invalid = this.touched && this.invalid;

    if (invalid !== this.invalidInternal) {
      this.invalidInternal = invalid;
      this.changeDetectorRef.markForCheck();
    }

    return this.touched && this.invalid;
  }

  public get invalid(): boolean {
    this.changeDetectorRef.markForCheck();
    return this.safeNgControlData<boolean>(({ invalid }) => invalid, false);
  }

  public get touched(): boolean {
    return this.safeNgControlData<boolean>(({ touched }) => touched, false);
  }

  public get value(): T {
    return this.previousValue ?? this.fallbackValue;
  }

  public get disabled(): boolean {
    return this.safeNgControlData<boolean>(({ disabled }) => disabled, false);
  }

  constructor(
    protected readonly ngControl: NgControl,
    protected readonly changeDetectorRef: ChangeDetectorRef
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  protected abstract getFallbackValue(): T;

  public writeValue(value: T | null): void {
    this.previousValue = value;
    this.changeDetectorRef.markForCheck();
  }

  public registerOnChange(fn: typeof EMPTY_FUNCTION): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: typeof EMPTY_FUNCTION): void {
    this.onTouched = fn;
  }

  protected updateValue(value: T): void {
    if (this.valueIdenticalComparator(this.value, value)) {
      return;
    }
    this.previousValue = value;
    this.controlSetValue(value);
  }

  protected updateFocused(focused: boolean): void {
    if (!focused) {
      this.onTouched();
    }
  }

  protected valueIdenticalComparator(oldValue: T, newValue: T): boolean {
    return oldValue === newValue;
  }

  private controlSetValue(value: T): void {
    this.onChange(value);
    this.changeDetectorRef.markForCheck();
  }

  private safeNgControlData<T>(
    extractor: (ngControl: NgControl) => T | null | undefined,
    defaultFieldValue: T
  ): T {
    return (this.ngControl && extractor(this.ngControl)) ?? defaultFieldValue;
  }
}
