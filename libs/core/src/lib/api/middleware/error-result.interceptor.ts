import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, switchMap } from 'rxjs';

import { ErrorResult } from '../../common';
import { parseContext } from '../common';

@Injectable()
export class MosErrorResultInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>
  ): Observable<unknown> {
    const { req } = parseContext(context);

    return next.handle().pipe(
      switchMap((result) => Promise.resolve(result)),
      map((result) => {
        if (Array.isArray(result)) {
          for (const item of result) {
            this.translateResult(req, item);
          }
        } else {
          this.translateResult(req, result);
        }
        return result;
      })
    );
  }

  private translateResult(req: any, result: unknown) {
    if (result instanceof ErrorResult) {
      //this.i18nService.translateErrorResult(req, result as any);
    }
  }
}
