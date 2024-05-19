import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MosDialogModule } from '@mosaic/ui/dialog';
import { MosInputModule } from '@mosaic/ui/input';
import { MosDropdownModule } from '@mosaic/ui/dropdown';
import { MosScrollModule } from '@mosaic/ui/scroll';

import { MosAddressComponent } from './address.component';

@NgModule({
  declarations: [MosAddressComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MosDialogModule,
    MosDropdownModule,
    MosInputModule,
    MosScrollModule,
  ],
  providers: [],
  exports: [MosAddressComponent],
})
export class MosAddressModule {}
