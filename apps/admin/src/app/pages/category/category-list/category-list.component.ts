import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Category, PaginatedList } from '@mosaic/common';

import { BaseListComponent } from '../../../common/base-list';
import { CategoryDataService, CategoryListQueryResult } from '../../../data';

@Component({
  selector: 'mos-category-list',
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent
  extends BaseListComponent<CategoryListQueryResult, Category>
  implements OnInit
{
  constructor(activateRoute: ActivatedRoute) {
    super(activateRoute);

    const dataService = inject(CategoryDataService);

    super.setQueryFn(
      () => dataService.getCategories(),
      ({ categories }: CategoryListQueryResult): PaginatedList<Category> =>
        categories
    );
  }
}
