import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { LocalStorageService } from '../providers';

const authTokenHeaderKey = 'mosaic-auth-token';

export function defaultInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  const localStorage = inject(LocalStorageService);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const authToken = event.headers.get(authTokenHeaderKey);

        if (authToken) {
          localStorage.set('authToken', authToken);
        }
      }
    })
  );
}
