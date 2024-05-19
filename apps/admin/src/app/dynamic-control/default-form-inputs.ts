import {
  APP_INITIALIZER,
  ChangeDetectionStrategy,
  Component,
  FactoryProvider,
  Inject,
  Type,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MosInputModule } from '@mosaic/ui/input';

import {
  ComponentRegistryService,
  FormInputComponent,
} from './component-registry.service';
import { MOSAIC_CONTEXT } from '@mosaic/cdk';

export type DefaultFormComponentId = 'text-form-input';

@Component({
  imports: [CommonModule, ReactiveFormsModule, MosInputModule],
  selector: 'mos-dynamic-text-input',
  template: '<mos-input [formControl]="formControl"></mos-input>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MosTextInputComponent extends FormInputComponent {
  public static readonly id: DefaultFormComponentId = 'text-form-input';

  constructor(@Inject(MOSAIC_CONTEXT) context: any) {
    super(context);
  }
}

export const defaultFormInputs = [MosTextInputComponent];

export function registerFormInputComponent(
  id: DefaultFormComponentId,
  component: Type<FormInputComponent>
): FactoryProvider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: (registry: ComponentRegistryService) => () => {
      registry.registerInputComponent(id, component);
    },
    deps: [ComponentRegistryService],
  };
}

export function registerDefaultFormInputs(): FactoryProvider[] {
  return defaultFormInputs.map((cmp) =>
    registerFormInputComponent(cmp.id, cmp)
  );
}
