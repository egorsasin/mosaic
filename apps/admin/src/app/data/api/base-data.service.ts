import { Injectable } from '@angular/core';
import {
  MutationUpdaterFn,
  SingleExecutionResult,
  WatchQueryFetchPolicy,
} from '@apollo/client/core';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql/language/ast';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { QueryResult } from '../../common/query-result';

@Injectable()
export class BaseDataService {
  constructor(private apollo: Apollo) {}

  /**
   * Performs a GraphQL watch query
   */
  query<T, V extends Record<string, any> = Record<string, any>>(
    query: DocumentNode | TypedDocumentNode<T, V>,
    variables?: V,
    fetchPolicy: WatchQueryFetchPolicy = 'cache-and-network'
  ): QueryResult<T, V> {
    const queryRef = this.apollo.watchQuery<T, V>({
      query,
      variables,
      fetchPolicy,
    });
    const queryResult = new QueryResult<T, any>(queryRef, this.apollo);
    return queryResult;
  }

  /**
   * Performs a GraphQL mutation
   */
  mutate<T, V extends Record<string, any> = Record<string, any>>(
    mutation: DocumentNode | TypedDocumentNode<T, V>,
    variables?: V,
    update?: MutationUpdaterFn<T>
  ): Observable<T> {
    return this.apollo
      .mutate<T, V>({
        mutation,
        variables,
        update,
      })
      .pipe(map((result) => (result as SingleExecutionResult).data as T));
  }
}
