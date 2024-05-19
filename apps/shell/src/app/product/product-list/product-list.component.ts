import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ListOptions, Product } from '../../types';
import { BaseListComponent } from '../base-list.component';
import { ProductService } from '../product.service';
import { GetProductList } from '../product.types';

@Component({
  selector: 'mos-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent
  extends BaseListComponent<GetProductList.Query, Product>
  implements OnInit
{
  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(activatedRoute);

    const listQueryFn = (options: ListOptions) =>
      this.productService.getProducts(options);

    const mappingFn = (data: GetProductList.Query) => data.products;

    super.setQueryFn(listQueryFn, mappingFn);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  public onPageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: page ? page + 1 : null,
      },
      queryParamsHandling: 'merge',
    });
  }
}
