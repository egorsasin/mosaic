import { ApolloQueryResult, NetworkStatus } from '@apollo/client/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subject } from 'rxjs';
import { filter, finalize, map, take } from 'rxjs/operators';

/**
 * @description
 * This class wraps the Apollo Angular QueryRef object and exposes some getters
 * for convenience.
 *
 * @docsCategory services
 * @docsPage DataService
 */
export class QueryResult<
  T,
  V extends Record<string, any> = Record<string, any>
> {
  public completed$ = new Subject<void>();
  private valueChanges: Observable<ApolloQueryResult<T>>;

  constructor(private queryRef: QueryRef<T, V>, private apollo: Apollo) {
    this.valueChanges = queryRef.valueChanges;
  }

  /**
   * @description
   * Returns an Observable which emits a single result and then completes.
   */
  public get single$(): Observable<T> {
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

  /**
   * @description
   * Returns an Observable which emits until unsubscribed.
   */
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

  /**
   * @description
   * Returns a single-result Observable after applying the map function.
   */
  public mapSingle<R>(mapFn: (item: T) => R): Observable<R> {
    return this.single$.pipe(map(mapFn));
  }

  /**
   * @description
   * Returns a multiple-result Observable after applying the map function.
   */
  public mapStream<R>(mapFn: (item: T) => R): Observable<R> {
    return this.stream$.pipe(map(mapFn));
  }
}
