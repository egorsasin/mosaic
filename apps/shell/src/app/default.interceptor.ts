import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LocalStorageService } from './services/local-storage.service';

@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  private readonly authTokenHeaderKey: string = 'mosaic-auth-token'; //TODO Move to config

  constructor(private localStorageService: LocalStorageService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.checkForAuthToken(event);
        }
      })
    );
  }

  private checkForAuthToken(response: HttpResponse<any>): void {
    const authToken = response.headers.get(this.authTokenHeaderKey);

    if (authToken) {
      this.localStorageService.set('authToken', authToken);
    }
  }
}
