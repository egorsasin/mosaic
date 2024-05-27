import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  Optional,
  Self,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import { MosAbstractControl } from '@mosaic/cdk/abstract';

import { MosBaseInputComponent } from '../base-input';

type MosInputType = 'password' | 'text';

@Component({
  selector: 'mos-input-password',
  templateUrl: './input-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosInputPasswordComponent extends MosAbstractControl<string> {
  @Input() public placeholder = '';
  @Input() public readonly = false;
  @Input() public labelOutside = false;

  @ViewChild(MosBaseInputComponent, { static: true })
  public baseInput?: MosBaseInputComponent;

  protected isPassword = true;

  public get inputType(): MosInputType {
    return this.isPassword ? 'password' : 'text';
  }

  constructor(
    @Self() @Optional() ngControl: NgControl,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(ngControl, changeDetectorRef);
  }

  public handleOption(option: string): void {
    this.baseInput?.inputElement?.nativeElement.focus();
    this.updateValue(option);
  }

  public valueChanges(value: string): void {
    this.updateValue(value);
  }

  protected getFallbackValue(): string {
    return '';
  }
}
