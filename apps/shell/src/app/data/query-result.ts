import { ApolloQueryResult, NetworkStatus } from '@apollo/client/core';
import { QueryRef } from 'apollo-angular';
import { OperationVariables } from '@apollo/client';
import { Observable, Subject } from 'rxjs';
import { filter, finalize, map, take } from 'rxjs/operators';
import type { EmptyObject } from 'apollo-angular/types';

export class QueryResult<T, V extends OperationVariables = EmptyObject> {
  private valueChanges: Observable<ApolloQueryResult<T>>;

  public completed$ = new Subject<void>();

  constructor(private queryRef: QueryRef<T, V>) {
    this.valueChanges = queryRef.valueChanges;
  }

  get single$(): Observable<T> {
    return this.valueChanges.pipe(
      filter((result) => result.networkStatus === NetworkStatus.ready),
      take(1),
      map((result) => result.data),
      finalize(() => {
        this.completed$.next();
        this.completed$.complete();
      })
    );
  }

  public get stream$(): Observable<T> {
    return this.valueChanges.pipe(
      filter((result) => result.networkStatus === NetworkStatus.ready),
      map((result) => result.data),
      finalize(() => {
        this.completed$.next();
        this.completed$.complete();
      })
    );
  }

  public get ref(): QueryRef<T, V> {
    return this.queryRef;
  }

  public mapSingle<R>(mapFn: (item: T) => R): Observable<R> {
    return this.single$.pipe(map(mapFn));
  }

  public mapStream<R>(mapFn: (item: T) => R): Observable<R> {
    return this.stream$.pipe(map(mapFn));
  }
}
