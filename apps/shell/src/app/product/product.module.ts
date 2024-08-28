import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MosAssetPreviewPipe } from '@mosaic/common-ui';
import { MosIconComponent } from '@mosaic/ui/svg-icon';
import { HintModule } from '@mosaic/ui/hint';

import { PaginationComponent } from '../pagination/pagination.component';

import { ProductCardComponent } from './product-card/product-card.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductService } from './product.service';
import { MosQuantitySelectorComponent } from '../shared';
import { ProductDetailComponent } from './product-detail';

const routes: Routes = [
  {
    path: '',
    component: ProductListComponent,
  },
  {
    path: 'product/:slug',
    component: ProductDetailComponent,
  },
];

@NgModule({
  declarations: [
    ProductListComponent,
    ProductCardComponent,
    ProductDetailComponent,
  ],
  imports: [
    ReactiveFormsModule,
    PaginationComponent,
    MosAssetPreviewPipe,
    FormsModule,
    CommonModule,
    HintModule,
    MosQuantitySelectorComponent,
    MosIconComponent,
    RouterModule.forChild(routes),
  ],
  providers: [ProductService],
})
export class ProductModule {}
