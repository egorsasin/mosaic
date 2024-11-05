import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  EMPTY,
  Observable,
  Subject,
  combineLatest,
  distinctUntilChanged,
  map,
  shareReplay,
  takeUntil,
} from 'rxjs';

import { Maybe, PaginatedList } from '@mosaic/common';
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

export type OnPageChangeFn<V> = (options: ListOptions) => V;

export type MappingFn<T, R> = (result: R) => PaginatedList<T>;

const DEFAULTS: { take: number; skip: number } = { take: 10, skip: 0 };

@Directive()
export class BaseListComponent<ResultType, T, VariableType = any>
  implements OnInit, OnDestroy
{
  protected destroy$: Subject<void> = new Subject<void>();
  protected refresh$ = new Subject<void>();

  private listQueryFn?: ListQueryFn<ResultType>;
  private mappingFn!: MappingFn<any, any>;
  private onPageChangeFn: OnPageChangeFn<VariableType> = (
    options: ListOptions
  ) => ({ options } as any);
  private defaults: ListOptions = { take: 20 };

  public items$: Observable<T[]> = EMPTY;
  public result$: Observable<any> = EMPTY;
  public currentPage$: Observable<number> = this.route.queryParamMap.pipe(
    map((params: ParamMap) => params.get('page')),
    map((page?: Maybe<string>) => (page ? +page - 1 : 0)),
    distinctUntilChanged()
  );

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
    const listQuery = this.listQueryFn(DEFAULTS);

    // const fetchPage = ([currentPage, itemsPerPage, _]: [
    //   number,
    //   number,
    //   undefined
    // ]) => {
    //   const take = itemsPerPage;
    //   const skip = (currentPage - 1) * itemsPerPage;
    //   this.listQuery.ref.refetch(this.onPageChangeFn(skip, take));
    // };

    this.result$ = listQuery.stream$.pipe(shareReplay(1));
    this.items$ = this.result$.pipe(map((data) => this.mappingFn(data).items));
    // this.totalItems$ = this.result$.pipe(
    //   map((data) => this.mappingFn(data).totalItems)
    // );
    // this.currentPage$ = this.route.queryParamMap.pipe(
    //   map((qpm) => qpm.get('page')),
    //   map((page) => (!page ? 1 : +page)),
    //   distinctUntilChanged()
    // );

    const fetchPage = ([currentPage, _]: [number, unknown]) => {
      const { take } = this.defaults;
      const skip = currentPage * take;

      listQuery.ref.refetch(this.onPageChangeFn({ skip, take }) as any);
    };

    combineLatest([this.currentPage$, this.refresh$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(fetchPage);
  }

  /** @internal */
  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
