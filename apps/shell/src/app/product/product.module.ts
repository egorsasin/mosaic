import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MosAssetPreviewPipe } from '@mosaic/common-ui';

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
    PaginationComponent,
    MosAssetPreviewPipe,
    FormsModule,
    CommonModule,
    MosQuantitySelectorComponent,
    RouterModule.forChild(routes),
  ],
  providers: [ProductService],
})
export class ProductModule {}
