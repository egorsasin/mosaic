import { Component, Inject } from '@angular/core';
import { MOSAIC_CONTEXT } from '@mosaic/cdk';

@Component({
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class MosDialogComponent {
  protected get header(): any {
    return this.context.header;
  }

  constructor(@Inject(MOSAIC_CONTEXT) public context: any) {}
}
