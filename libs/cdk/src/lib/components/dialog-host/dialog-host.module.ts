import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosDialogHostComponent } from './dialog-host.component';
import { MosComponentOutletDirective } from './component-outlet.directive';
import { MosDialogHostService } from './dialog-host.service';

@NgModule({
  imports: [CommonModule, MosComponentOutletDirective],
  declarations: [MosDialogHostComponent],
  exports: [MosDialogHostComponent],
  providers: [MosDialogHostService],
})
export class MosDialogHostModule {}
