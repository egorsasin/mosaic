import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  Subject,
  takeUntil,
} from 'rxjs';

import { QueryResult } from '../data/query-result';
import { ListOptions, Maybe } from '../types';

export type ListQueryFn<R> = (options: ListOptions) => QueryResult<R, any>;

export type MappingFn<T, R> = (result: R) => { items: T[]; totalItems: number };
export type OnPageChangeFn<V> = (options: ListOptions) => V;

@Directive()
export class BaseListComponent<ResultType, ItemType, VariableType = any>
  implements OnInit, OnDestroy
{
  public items$?: Observable<ItemType[]>;
  public currentPage$: Observable<number> = this.route.queryParamMap.pipe(
    map((params: ParamMap) => params.get('page')),
    map((page?: Maybe<string>) => (page ? +page - 1 : 0)),
    distinctUntilChanged()
  );
  public totalItems$?: Observable<number>;

  private defaults: ListOptions = { take: 12 };
  protected destroy$: Subject<void> = new Subject<void>();

  private listQueryFn?: ListQueryFn<ResultType>;
  private mappingFn?: MappingFn<ItemType, ResultType>;
  private onPageChangeFn: OnPageChangeFn<VariableType> = (
    options: ListOptions
  ) => ({ options } as any);

  constructor(private route: ActivatedRoute) {}

  public setQueryFn(
    listQueryFn: ListQueryFn<ResultType>,
    mappingFn: MappingFn<ItemType, ResultType>,
    onPageChangeFn?: OnPageChangeFn<VariableType>
  ): void {
    this.listQueryFn = listQueryFn;
    this.mappingFn = mappingFn;

    if (onPageChangeFn) {
      this.onPageChangeFn = onPageChangeFn;
    }
  }

  public ngOnInit(): void {
    if (!this.listQueryFn) {
      throw new Error(
        `No listQueryFn has been defined. Please call super.setQueryFn() in the constructor.`
      );
    }

    const listQuery = this.listQueryFn(this.defaults);
    const result$ = listQuery.stream$.pipe(shareReplay(1));

    this.items$ = result$.pipe(
      map((data: ResultType) =>
        this.mappingFn ? this.mappingFn(data).items : []
      )
    );

    this.totalItems$ = result$.pipe(
      map((data) => (this.mappingFn ? this.mappingFn(data).totalItems : 0))
    );

    const fetchPage = (currentPage: number) => {
      const { take } = this.defaults;
      const skip = currentPage * take;
      listQuery.ref.refetch(this.onPageChangeFn({ skip, take }));
    };

    this.currentPage$.pipe(takeUntil(this.destroy$)).subscribe(fetchPage);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete;
  }
}
