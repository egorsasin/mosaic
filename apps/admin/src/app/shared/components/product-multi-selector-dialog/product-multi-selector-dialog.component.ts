import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { Product } from '@mosaic/common';

import { SelectionManager } from '../asset-picker-dialog/selection-manager';
import { ProductDataService } from '../../../data';

export type SearchItem = Product;

@Component({
  selector: 'mos-product-multi-selector-dialog',
  templateUrl: './product-multi-selector-dialog.component.html',
  styleUrls: ['./product-multi-selector-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosProductMultiSelectorDialogComponent implements OnInit {
  mode: 'product' | 'variant' = 'product';
  initialSelectionIds: string[] = [];
  items$: Observable<SearchItem[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  searchFacetValueIds$ = new BehaviorSubject<string[]>([]);
  paginationConfig = {
    currentPage: 1,
    itemsPerPage: 25,
    totalItems: 1,
  };
  selectionManager?: SelectionManager<SearchItem>;

  //   resolveWith: (result?: SearchItem[]) => void;
  //   private paginationConfig$ = new BehaviorSubject<PaginationInstance>(
  //     this.paginationConfig
  //   );

  constructor(
    private dataService: ProductDataService // private changeDetector: ChangeDetectorRef
  ) {
    const searchQueryResult = this.dataService.searchProducts(
      '',
      this.paginationConfig.itemsPerPage,
      0
    );

    this.items$ = searchQueryResult.stream$.pipe(
      // tap((data) => {
      //   this.paginationConfig.totalItems = data.search.totalItems;
      //   this.selectionManager.setCurrentItems(data.search.items);
      // }),
      map(({ search }) => search.items)
    );
  }

  ngOnInit(): void {
    console.log('ON INIT');
    // const idFn =
    //     this.mode === 'product'
    //         ? (a: SearchItem, b: SearchItem) => a.productId === b.productId
    //         : (a: SearchItem, b: SearchItem) => a.productVariantId === b.productVariantId;
    // this.selectionManager = new SelectionManager<SearchItem>({
    //     multiSelect: true,
    //     itemsAreEqual: idFn,
    //     additiveMode: true,
    // });

    // const result$ = combineLatest(
    //     this.searchTerm$,
    //     this.searchFacetValueIds$,
    //     this.paginationConfig$,
    // ).subscribe(([term, facetValueIds, pagination]) => {
    //     const take = +pagination.itemsPerPage;
    //     const skip = (pagination.currentPage - 1) * take;
    //     return searchQueryResult.ref.refetch({
    //         input: { skip, take, term, facetValueIds, groupByProduct: this.mode === 'product' },
    //     });
    // });
    // this.items$ = searchQueryResult.stream$.pipe(
    //     tap(data => {
    //         this.paginationConfig.totalItems = data.search.totalItems;
    //         this.selectionManager.setCurrentItems(data.search.items);
    //     }),
    //     map(data => data.search.items),
    // );
    // this.facetValues$ = searchQueryResult.stream$.pipe(map(data => data.search.facetValues));
    // if (this.initialSelectionIds.length) {
    //     if (this.mode === 'product') {
    //         this.dataService.product
    //             .getProducts({
    //                 filter: {
    //                     id: {
    //                         in: this.initialSelectionIds,
    //                     },
    //                 },
    //             })
    //             .single$.subscribe(({ products }) => {
    //                 this.selectionManager.selectMultiple(
    //                     products.items.map(
    //                         product =>
    //                             ({
    //                                 productId: product.id,
    //                                 productName: product.name,
    //                             } as SearchItem),
    //                     ),
    //                 );
    //                 this.changeDetector.markForCheck();
    //             });
    //     } else {
    //         this.dataService
    //             .query(GetProductVariantsForMultiSelectorDocument, {
    //                 options: {
    //                     filter: {
    //                         id: {
    //                             in: this.initialSelectionIds,
    //                         },
    //                     },
    //                 },
    //             })
    //             .single$.subscribe(({ productVariants }) => {
    //                 this.selectionManager.selectMultiple(
    //                     productVariants.items.map(
    //                         variant =>
    //                             ({
    //                                 productVariantId: variant.id,
    //                                 productVariantName: variant.name,
    //                             } as SearchItem),
    //                     ),
    //                 );
    //                 this.changeDetector.markForCheck();
    //             });
    //     }
    // }
  }

  trackByFn(index: number, item: SearchItem) {
    return item.id;
  }

  setSearchTerm(term: string) {
    // this.searchTerm$.next(term);
  }
  setFacetValueIds(ids: string[]) {
    // this.searchFacetValueIds$.next(ids);
  }

  toggleSelection(item: SearchItem, event: MouseEvent) {
    // this.selectionManager.toggleSelection(item, event);
  }

  clearSelection() {
    // this.selectionManager.selectMultiple([]);
  }

  isSelected(item: SearchItem) {
    // return this.selectionManager.isSelected(item);
  }

  entityInfoClick(event: MouseEvent) {
    // event.preventDefault();
    // event.stopPropagation();
  }

  pageChange(page: number) {
    // this.paginationConfig.currentPage = page;
    // this.paginationConfig$.next(this.paginationConfig);
  }

  itemsPerPageChange(itemsPerPage: number) {
    // this.paginationConfig.itemsPerPage = itemsPerPage;
    // this.paginationConfig$.next(this.paginationConfig);
  }

  select() {
    //this.resolveWith(this.selectionManager.selection);
  }

  cancel() {
    //this.resolveWith();
  }
}
