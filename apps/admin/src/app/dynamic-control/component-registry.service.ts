import { Injectable, Injector, Provider, Type } from '@angular/core';
import { ContextWrapper } from '@mosaic/cdk';
import { UntypedFormControl } from '@angular/forms';

import { DefaultFormComponentId } from '@mosaic/common';

export abstract class FormInputComponent {
  public get formControl(): UntypedFormControl {
    return this.context.control;
  }

  constructor(public context: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class ComponentRegistryService {
  private inputComponentMap = new Map<
    DefaultFormComponentId,
    ContextWrapper<FormInputComponent>
  >();

  public registerInputComponent(
    id: DefaultFormComponentId,
    component: Type<FormInputComponent>,
    providers?: Provider[]
  ) {
    if (this.inputComponentMap.has(id)) {
      throw new Error(
        `Cannot register an InputComponent with the id "${id}", as one with that id already exists`
      );
    }
    this.inputComponentMap.set(
      id,
      new ContextWrapper(
        component,
        Injector.create({
          providers: providers || [],
        })
      )
    );
  }

  public getInputComponent(
    id: DefaultFormComponentId
  ): ContextWrapper<FormInputComponent> | undefined {
    return this.inputComponentMap.get(id);
  }
}
