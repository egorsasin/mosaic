import { Injectable } from '@angular/core';
import { MutationUpdaterFn, WatchQueryFetchPolicy } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { OperationVariables } from '@apollo/client';
import { DocumentNode } from 'graphql/language/ast';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { EmptyObject } from 'apollo-angular/types';

import { QueryResult } from './query-result';

@Injectable()
export class DataService {
  constructor(private apollo: Apollo) {}

  public query<T, V extends OperationVariables = EmptyObject>(
    query: DocumentNode,
    variables?: V,
    fetchPolicy: WatchQueryFetchPolicy = 'cache-and-network'
  ): QueryResult<T, V> {
    const queryRef = this.apollo.watchQuery<T, V>({
      query,
      variables,
      fetchPolicy,
    });
    return new QueryResult<T, V>(queryRef);
  }

  public mutate<T, V extends OperationVariables = EmptyObject>(
    mutation: DocumentNode,
    variables?: V,
    update?: MutationUpdaterFn<T>
  ): Observable<T> {
    return this.apollo
      .mutate<T, V>({
        mutation,
        variables,
        update,
      })
      .pipe(map((result) => result.data as T));
  }
}
