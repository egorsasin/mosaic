import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ListOptions, Product } from '../../types';
import { BaseListComponent } from '../base-list.component';
import { ProductService } from '../product.service';
import { GetProductList } from '../product.types';
import { CategoryService } from '../../data';
import {
  distinctUntilChanged,
  map,
  merge,
  Observable,
  takeUntil,
  tap,
} from 'rxjs';

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
  public categories$ = this.categoryService
    .getCategories()
    .single$.pipe(map(({ categories }) => categories.items));

  public categorySlug = signal<string>(
    this.activatedRoute.snapshot.queryParams['category']
  );

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(activatedRoute);

    const extendOptions = (options: ListOptions) => ({
      ...options,
      ...(this.categorySlug()
        ? {
            categorySlug: this.categorySlug(),
          }
        : {}),
    });
    const listQueryFn = (options: ListOptions) =>
      this.productService.getProducts(extendOptions(options));

    const mappingFn = (data: GetProductList.Query) => data.search;

    super.setQueryFn(listQueryFn, mappingFn, (options: ListOptions) => ({
      input: extendOptions(options),
    }));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.refreshListOnChanges();
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

  protected refreshListOnChanges(...streams: Observable<unknown>[]) {
    const category$ = this.activatedRoute.queryParams.pipe(
      map(({ category }) => category),
      distinctUntilChanged(),
      tap((category: string) => {
        this.categorySlug.set(category);
        this.setPageNumber(1);
      })
    );

    merge(category$, ...streams)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refresh$.next(undefined));
  }
}
