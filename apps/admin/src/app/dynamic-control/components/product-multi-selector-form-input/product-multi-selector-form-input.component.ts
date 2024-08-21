import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { DefaultFormComponentId } from '@mosaic/common';
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
    private dialogService: MosDialogService
  ) {
    super(context);
  }

  public select(): void {
    const wrapper = new ContextWrapper(MosProductMultiSelectorDialogComponent);

    this.dialogService
      .open(wrapper, {
        label: 'Select products',
      })
      .subscribe();
    // this.modalService
    //   .fromComponent(ProductMultiSelectorDialogComponent, {
    //     size: 'xl',
    //     locals: {
    //       mode: this.mode,
    //       initialSelectionIds: this.formControl.value.map((item) =>
    //         typeof item === 'string' ? item : item.id
    //       ),
    //     },
    //   })
    //   .subscribe((selection) => {
    //     if (selection) {
    //       this.formControl.setValue(
    //         selection.map((item) =>
    //           this.mode === 'product' ? item.productId : item.productVariantId
    //         )
    //       );
    //       this.formControl.markAsDirty();
    //       this.changeDetector.markForCheck();
    //     }
    //   });
  }
}
