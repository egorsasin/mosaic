import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
} from '@angular/core';

import { DefaultFormComponentId, Product } from '@mosaic/common';
import { ContextWrapper, MOSAIC_CONTEXT } from '@mosaic/cdk';
import { MosDialogService } from '@mosaic/ui/dialog';

import { MosProductMultiSelectorDialogComponent } from '../../../shared/components';
import { FormInputComponent } from '../../component-registry.service';

@Component({
  selector: 'mos-product-multi-selector-form-input',
  templateUrl: './product-multi-selector-form-input.component.html',
  styleUrls: ['./product-multi-selector-form-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosProductMultiSelectorFormInputComponent<
  T
> extends FormInputComponent {
  readonly isListInput = true;
  static readonly id: DefaultFormComponentId = 'product-multi-form-input';

  constructor(
    @Inject(MOSAIC_CONTEXT) context: T,
    private dialogService: MosDialogService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(context);
  }

  public select(): void {
    const wrapper = new ContextWrapper(MosProductMultiSelectorDialogComponent);

    this.dialogService
      .open<Product[]>(wrapper, {
        label: 'Select products',
      })
      .subscribe((selection: Product[]) => {
        if (selection) {
          this.formControl.setValue(selection.map(({ id }) => id));

          this.formControl.markAsDirty();
          this.changeDetectorRef.markForCheck();
        }
      });
  }
}
