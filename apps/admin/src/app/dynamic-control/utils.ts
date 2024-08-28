import { APP_INITIALIZER, FactoryProvider, Type } from '@angular/core';

import { DefaultFormComponentId } from '@mosaic/common';

import {
  ComponentRegistryService,
  FormInputComponent,
} from './component-registry.service';
import {
  MosProductMultiSelectorFormInputComponent,
  MosTextInputComponent,
} from './components';

export const defaultFormInputs = [
  MosTextInputComponent,
  MosProductMultiSelectorFormInputComponent,
];

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
