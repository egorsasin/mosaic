import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PaginatedList } from '@mosaic/common';

import { BaseListComponent } from '../../../common/base-list';
import { ProductDataService } from '../product.service';

interface Product {
  id: number;
  name: string;
}

@Component({
  selector: 'mos-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent
  extends BaseListComponent<any, any>
  implements OnInit
{
  constructor(
    activateRoute: ActivatedRoute,
    private dataService: ProductDataService
  ) {
    super(activateRoute);
    super.setQueryFn(
      (args: any) => this.dataService.getProducts(args),
      (data: { products: PaginatedList<Product> }): PaginatedList<Product> =>
        data.products
    );
  }

  public override ngOnInit() {
    super.ngOnInit();
  }
}
