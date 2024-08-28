import {
  ActivatedRouteSnapshot,
  ActivationStart,
  ResolveFn,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
import { ResultOf, TypedDocumentNode } from 'apollo-angular';
import { Observable, filter, map, of, shareReplay, takeUntil } from 'rxjs';

import { notNullOrUndefined } from '@mosaic/common';

import { BaseDataService } from '../data';

export const CREATE_ROUTE_PARAM = 'create';

export const createBaseDetailResolveFn = <
  T extends TypedDocumentNode,
  Field extends keyof ResultOf<T>
>(config: {
  query: T;
  entityKey: Field;
}): ResolveFn<{
  entity: Observable<ResultOf<T>[Field] | null>;
  result?: ResultOf<T>;
}> => {
  return (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);
    const dataService = inject(BaseDataService);
    const id = route.paramMap.get('id');

    const navigateAway$ = router.events.pipe(
      filter((event) => event instanceof ActivationStart)
    );

    if (id == null) {
      throw new Error('No id found in route');
    } else if (id === CREATE_ROUTE_PARAM) {
      return of({ entity: of(null) });
    }

    const result$: Observable<ResultOf<T>> = dataService
      .query<ResultOf<T>>(config.query, { id: parseInt(id) })
      .stream$.pipe(takeUntil(navigateAway$), shareReplay(1));

    const entity$ = result$.pipe(
      map((result) => result[config.entityKey]),
      filter(notNullOrUndefined)
    );

    return result$.pipe(
      map((result) => ({
        entity: entity$,
        result: result as ResultOf<T>,
      }))
    );
  };
};
