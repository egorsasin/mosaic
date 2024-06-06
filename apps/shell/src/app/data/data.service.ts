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

  public query<R, V extends OperationVariables = EmptyObject>(
    query: DocumentNode,
    variables?: V,
    fetchPolicy: WatchQueryFetchPolicy = 'cache-and-network'
  ): QueryResult<R, V> {
    const queryRef = this.apollo.watchQuery<R, V>({
      query,
      variables,
      fetchPolicy,
    });
    return new QueryResult<R, V>(queryRef);
  }

  public mutate<R, V extends OperationVariables = EmptyObject>(
    mutation: DocumentNode,
    variables?: V,
    update?: MutationUpdaterFn<R>
  ): Observable<R> {
    return this.apollo
      .mutate<R, V>({
        mutation,
        variables,
        update,
      })
      .pipe(map((result) => result.data as R));
  }
}
