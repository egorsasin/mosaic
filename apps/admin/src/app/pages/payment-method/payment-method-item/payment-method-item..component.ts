import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';

import {
  ConfigArgDefinition,
  ConfigurableOperationDefinition,
  CreatePaymentMethodInput,
} from '@mosaic/common';
import { IdentityMatcher, StringHandler } from '@mosaic/ui/types';

import { BaseDetailComponent } from '../../asset/asset-list/base-detail.component';
import { PaymentMethod } from '../types';
import { PaymentMethodDataService } from '../../../data';

interface PaymentMethodForm {
  name: FormControl<string>;
  description: FormControl<string>;
  enabled: FormControl<boolean>;
  handler: any;
}

@Component({
  selector: 'mos-payment-method',
  templateUrl: './payment-method-item.component.html',
})
export class PaymentMethodComponent extends BaseDetailComponent<PaymentMethod> {
  public handler: FormControl<ConfigurableOperationDefinition | null> =
    new FormControl(null);

  public detailForm: FormGroup<PaymentMethodForm> = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
    }),
    enabled: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
    handler: new FormControl(null),
  });
  public handlers: ConfigurableOperationDefinition[] = [];
  public paymentHandlerStringify: StringHandler<ConfigurableOperationDefinition> =
    ({ description }: ConfigurableOperationDefinition) => description;
  public paymentHandlerIdentify: IdentityMatcher<ConfigurableOperationDefinition> =
    (
      previous: ConfigurableOperationDefinition,
      current: ConfigurableOperationDefinition
    ) => previous.code === current.code;

  constructor(private dataService: PaymentMethodDataService) {
    super();
    this.init();

    this.handler.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((handler: ConfigurableOperationDefinition | null) => {
        const args = handler?.args
          ? handler.args.reduce(
              (acc, curr: ConfigArgDefinition) => ({
                ...acc,
                [curr.name]: curr.defaultValue,
              }),
              {}
            )
          : null;
        this.detailForm.controls.handler.setValue({
          code: handler?.code,
          args,
        });
      });

    this.dataService.getPaymentMethodOperations().single$.subscribe((data) => {
      //  this.checkers = data.paymentMethodEligibilityCheckers;
      this.handlers = data.paymentMethodHandlers;
      //  this.changeDetector.markForCheck();
      //  this.selectedCheckerDefinition =
      //    data.paymentMethodEligibilityCheckers.find(
      //      (c) => c.code === this.entity?.checker?.code
      //    );
      //  this.selectedHandlerDefinition = data.paymentMethodHandlers.find(
      //    (c) => c.code === this.entity?.handler?.code
      //  );
    });
  }

  public save(): void {
    const { handler, ...details } = this.detailForm.value;
    const args =
      handler?.args &&
      Object.keys(handler.args).map((key: string) => ({
        name: key,
        value: handler.args[key],
      }));

    const input = {
      ...details,
      handler: { code: handler?.code, arguments: args },
      code: 'paynow',
    } as CreatePaymentMethodInput;

    this.dataService.createPaymentMethod(input).subscribe((data) => {
      //   this.notificationService.success(
      //     _('common.notify-create-success'),
      //     {
      //       entity: 'PaymentMethod',
      //     }
      //   );
      //   this.detailForm.markAsPristine();
      //   this.changeDetector.markForCheck();
      //   this.router.navigate(['../', data.createPaymentMethod.id], {
      //     relativeTo: this.route,
      //   });
      // },
      // (err) => {
      //   this.notificationService.error(
      //     _('common.notify-create-error'),
      //     {
      //       entity: 'PaymentMethod',
      //     }
      //   );
    });
  }

  protected setFormValues(entity: PaymentMethod): void {
    this.detailForm.patchValue(entity);
  }
}
