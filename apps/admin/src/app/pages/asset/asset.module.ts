import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MosInputModule } from '@mosaic/ui/input';

import { AssetListComponent, FileDropDirective } from './asset-list';
import { AssetDataService } from './asset.service';
import { SharedModule } from '../../shared/shared.module';

const ROUTED_COMPONENTS = [AssetListComponent];

const routes: Routes = [
  {
    path: '',
    component: AssetListComponent,
  },
];

@NgModule({
  declarations: [...ROUTED_COMPONENTS, FileDropDirective],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MosInputModule,
    SharedModule,
  ],
  providers: [AssetDataService],
})
export class AssetModule {}
