import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { DefaultFormComponentId } from '@mosaic/common';
import { MosInputModule } from '@mosaic/ui/input';
import { MOSAIC_CONTEXT } from '@mosaic/cdk';

import { FormInputComponent } from '../component-registry.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, MosInputModule],
  selector: 'mos-dynamic-text-input',
  template: '<mos-input [formControl]="formControl"></mos-input>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MosTextInputComponent<T> extends FormInputComponent {
  public static readonly id: DefaultFormComponentId = 'text-form-input';

  constructor(@Inject(MOSAIC_CONTEXT) context: T) {
    super(context);
  }
}
