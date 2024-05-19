import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import {
  ConfigArgDefinition,
  ConfigurableOperationDefinition,
} from '@mosaic/common';
import {
  ComponentRegistryService,
  FormInputComponent,
} from '../../../dynamic-control/component-registry.service';
import { Subscription } from 'rxjs';
import { ContextWrapper } from '@mosaic/cdk';

/**
 * Used in exhaustiveness checks to assert a codepath should never be reached.
 */
export function assertNever(value: never): never {
  throw new Error(
    `Expected never, got ${typeof value} (${JSON.stringify(value)})`
  );
}

@Component({
  selector: 'mos-dynamic-input',
  templateUrl: './dynamic-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DynamicFormInputComponent,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DynamicFormInputComponent),
      multi: true,
    },
  ],
})
export class DynamicFormInputComponent
  implements ControlValueAccessor, Validator
{
  public components?: {
    component?: ContextWrapper<FormInputComponent>;
    context: any;
  }[];
  public form = new UntypedFormGroup({});

  @Input({ required: true }) public set operation(
    value: ConfigurableOperationDefinition
  ) {
    this.createForm(value);
    this.components = value.args.map((def: ConfigArgDefinition) => {
      const { component } = this.getInputComponentConfig(def);

      const result = {
        component: this.componentRegistryService.getInputComponent(component),
        context: { ...def, control: this.form.get(def.name) },
      };

      return result;
    });
  }

  private onChange?: (val: any) => void;
  private onTouch?: () => void;
  private subscription?: Subscription;
  private rawValue = {};

  constructor(private componentRegistryService: ComponentRegistryService) {}

  public validate(control: AbstractControl<any, any>): ValidationErrors | null {
    return null;
  }

  public writeValue(value: any): void {
    if (value) {
      this.rawValue = value;
      this.form.patchValue(value);
    }
  }

  public registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  public trackByName(index: number, arg: any): string {
    return arg.context.name;
  }

  private getInputComponentConfig(
    argDef: ConfigArgDefinition | undefined
  ): any {
    if (this.hasUiConfig(argDef) && argDef.ui.component) {
      return argDef.ui;
    }

    const type = argDef?.type;

    switch (type) {
      case 'string':
      case 'boolean': {
        return { component: 'text-form-input' };
      }
      default:
        assertNever(type as never);
    }
  }

  private hasUiConfig(def: unknown): def is { ui: { component: string } } {
    return (
      typeof def === 'object' && typeof (def as any)?.ui?.component === 'string'
    );
  }

  private createForm(operation: ConfigurableOperationDefinition): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.form = new UntypedFormGroup({});

    for (const arg of operation?.args || []) {
      const validators = arg.required ? Validators.required : undefined;
      this.form.addControl(arg.name, new UntypedFormControl(null, validators));
    }

    this.subscription = this.form.valueChanges.subscribe((value) => {
      if (this.onChange) {
        this.onChange({
          code: operation.code,
          args: value,
        });
      }
      if (this.onTouch) {
        this.onTouch();
      }
    });
  }
}
