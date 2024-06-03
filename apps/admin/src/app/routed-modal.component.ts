import { Component } from '@angular/core';

import { MosDialogService } from '@mosaic/ui/dialog';
import { ContextWrapper } from '@mosaic/cdk';

import { ProductItemComponent } from './product';

@Component({
  selector: 'mos-routed-modal',
  template: '',
  standalone: true,
})
export class RoutedModalComponent {
  constructor(dialogService: MosDialogService) {
    const wrapper = new ContextWrapper(ProductItemComponent);
    dialogService.open(wrapper).subscribe();
  }
}
