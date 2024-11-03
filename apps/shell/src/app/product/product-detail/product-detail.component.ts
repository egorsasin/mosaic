import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { filter, map, Observable, switchMap } from 'rxjs';

import { Exact, notNullOrUndefined, Product } from '@mosaic/common';

import { DataService, GET_PRODUCT_DETAIL } from '../../data';

import { FormControl } from '@angular/forms';

export type GetProductDetailQuery = {
  product: Product;
};

export type GetProductDetailQueryVariables = Exact<{
  slug: string;
}>;

@Component({
  selector: 'mos-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  public product$: Observable<Product>;

  public quantity: FormControl<number> = new FormControl<number>(1, {
    nonNullable: true,
  });

  constructor(private route: ActivatedRoute, private dataService: DataService) {
    const productSlug$: Observable<string> = this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get('slug')),
      filter(notNullOrUndefined)
    );

    this.product$ = productSlug$.pipe(
      switchMap(
        (slug: string) =>
          this.dataService.query<
            GetProductDetailQuery,
            GetProductDetailQueryVariables
          >(GET_PRODUCT_DETAIL, {
            slug,
          }).stream$
      ),
      map(({ product }) => product),
      filter(notNullOrUndefined)
    );
  }
}
