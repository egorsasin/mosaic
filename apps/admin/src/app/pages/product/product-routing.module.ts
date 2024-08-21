import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { createBaseDetailResolveFn } from '../../common/utils';
import { ProductItemComponent } from './product-item';
import { ProductListComponent } from './product-list';
import { GET_PRODUCT_DETAIL } from '../../data';

export const ROUTED_COMPONENTS = [ProductListComponent, ProductItemComponent];
export const CREATE_ROUTE_PARAM = 'create';

const routes: Routes = [
  {
    path: '',
    component: ProductListComponent,
  },
  {
    path: ':id',
    component: ProductItemComponent,
    resolve: {
      detail: createBaseDetailResolveFn({
        query: GET_PRODUCT_DETAIL,
        entityKey: 'product',
      }),
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductRoutingModule {}
