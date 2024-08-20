import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { createBaseDetailResolveFn } from '../../common/utils';
import { GET_PRODUCT_DETAIL } from './schema';
import { CategoryListComponent } from './category-list';
import { CategoryItemComponent } from './category-item/category-item.component';

export const ROUTED_COMPONENTS = [CategoryListComponent, CategoryItemComponent];
export const CREATE_ROUTE_PARAM = 'create';

const routes: Routes = [
  {
    path: '',
    component: CategoryListComponent,
  },
  {
    path: ':id',
    component: CategoryItemComponent,
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
export class CategoryRoutingModule {}
