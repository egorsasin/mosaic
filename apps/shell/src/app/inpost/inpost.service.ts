import { Injectable } from '@angular/core';

import { ShippingHandler } from '../shipping';
import { MosDialogService } from '@mosaic/ui/dialog';
import { MosInpostMapComponent } from './inpost-map.component';
import { ContextWrapper } from '@mosaic/cdk';
import { MosInpostComponent } from './inpost.component';
import { filter, of } from 'rxjs';

@Injectable()
export class InpostService implements ShippingHandler {
  constructor(private dialog: MosDialogService) {}

  public code = 'inpost-parcel-locker';

  public component = MosInpostComponent;

  public metadata?: Record<string, unknown>;

  public select(skipCache: boolean) {
    return skipCache && this.metadata
      ? of(this.metadata)
      : this.dialog
          .open<Record<string, unknown>>(
            new ContextWrapper(MosInpostMapComponent),
            {
              appearance: 'mos-dialog-map',
            }
          )
          .pipe(filter(Boolean));
  }
}
