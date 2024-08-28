import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { gql, TypedDocumentNode } from 'apollo-angular';

import { createBaseDetailResolveFn } from '../../common/utils';
import { CategoryListComponent } from './category-list';
import { CategoryItemComponent } from './category-item/category-item.component';
import { CATEGORY_FRAGMENT } from '../../data';

export const ROUTED_COMPONENTS = [CategoryListComponent, CategoryItemComponent];
export const CREATE_ROUTE_PARAM = 'create';

export const CATEGORY_DETAIL_QUERY: TypedDocumentNode = gql`
  query CategoryDetailQuery($id: Int!) {
    category(id: $id) {
      ...Category
    }
  }
  ${CATEGORY_FRAGMENT}
`;

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
        query: CATEGORY_DETAIL_QUERY,
        entityKey: 'category',
      }),
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryRoutingModule {}
