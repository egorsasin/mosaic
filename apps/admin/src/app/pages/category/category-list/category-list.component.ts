import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BaseListComponent } from '../../../common/base-list';

@Component({
  selector: 'mos-category-list',
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent
  extends BaseListComponent<any>
  implements OnInit
{
  constructor(activateRoute: ActivatedRoute) {
    super(activateRoute);
    // super.setQueryFn(
    //   (args: any) => this.dataService.getProducts(args),
    //   (data: { products: Paginated<Product> }): Paginated<Product> =>
    //     data.products
    // );
  }
}
