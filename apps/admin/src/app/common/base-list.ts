import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Observable, Subject, map, shareReplay } from 'rxjs';

import { PaginatedList } from '@mosaic/common';
import { QueryResult } from './query-result';

export type ItemOf<T, K extends keyof T> = T[K] extends { items: infer R }
  ? R extends unknown[]
    ? R[number]
    : R
  : never;

export interface Pagination {
  take: number;
  skip: number;
  total: number;
}

export type ListOptions = {
  take: number;
  skip?: number;
};

export type ListQueryFn<R> = (
  options: ListOptions & Record<string, unknown>
) => QueryResult<R>;

export type MappingFn<T, R> = (result: R) => PaginatedList<T>;

const DEFAULTS: { take: number; skip: number } = { take: 10, skip: 0 };

@Directive()
export class BaseListComponent<ResultType, T> implements OnInit, OnDestroy {
  protected destroy$: Subject<void> = new Subject<void>();

  private listQueryFn?: ListQueryFn<ResultType>;
  private listQuery: any;
  private mappingFn!: MappingFn<any, any>;

  public items$: Observable<T[]> = EMPTY;
  public result$: Observable<any> = EMPTY;

  constructor(protected route: ActivatedRoute) {}

  /**
   * @description
   * Sets the fetch function for the list being implemented.
   */
  public setQueryFn(
    listQueryFn: ListQueryFn<ResultType>,
    mappingFn: MappingFn<any, any>
  ): void {
    this.listQueryFn = listQueryFn;
    this.mappingFn = mappingFn;
  }

  /** @internal */
  public ngOnInit() {
    if (!this.listQueryFn) {
      throw new Error(
        `No listQueryFn has been defined. Please call super.setQueryFn() in the constructor.`
      );
    }
    this.listQuery = this.listQueryFn(DEFAULTS);

    // const fetchPage = ([currentPage, itemsPerPage, _]: [
    //   number,
    //   number,
    //   undefined
    // ]) => {
    //   const take = itemsPerPage;
    //   const skip = (currentPage - 1) * itemsPerPage;
    //   this.listQuery.ref.refetch(this.onPageChangeFn(skip, take));
    // };

    this.result$ = this.listQuery.stream$.pipe(shareReplay(1));
    this.items$ = this.result$.pipe(map((data) => this.mappingFn(data).items));
    // this.totalItems$ = this.result$.pipe(
    //   map((data) => this.mappingFn(data).totalItems)
    // );
    // this.currentPage$ = this.route.queryParamMap.pipe(
    //   map((qpm) => qpm.get('page')),
    //   map((page) => (!page ? 1 : +page)),
    //   distinctUntilChanged()
    // );
    // this.itemsPerPage$ = this.route.queryParamMap.pipe(
    //   map((qpm) => qpm.get('perPage')),
    //   map((perPage) => (!perPage ? this.defaults.take : +perPage)),
    //   distinctUntilChanged()
    // );

    // combineLatest(this.currentPage$, this.itemsPerPage$, this.refresh$)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(fetchPage);
  }

  /** @internal */
  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    this.listQuery.completed$.next();
  }
}
