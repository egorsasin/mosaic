import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BaseListComponent, Paginated } from '../../../common/base-list';
import { ProductDataService } from '../product.service';

interface Product {
  id: number;
  name: string;
}

@Component({
  selector: 'mosaic-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent
  extends BaseListComponent<Product>
  implements OnInit
{
  constructor(
    activateRoute: ActivatedRoute,
    private dataService: ProductDataService
  ) {
    super(activateRoute);
    super.setQueryFn(
      (args: any) => this.dataService.getProducts(args),
      (data: { products: Paginated<Product> }): Paginated<Product> =>
        data.products
    );
  }

  public override ngOnInit() {
    super.ngOnInit();
  }
}
