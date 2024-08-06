import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HttpLink } from 'apollo-angular/http';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { createUploadLink } from 'apollo-upload-client';

import { OverlayHostComponent } from '@mosaic/ui/overlay-host';
import { MosDialogHostModule } from '@mosaic/cdk';
import { MosDialogModule } from '@mosaic/ui/dialog';
import { MosAlertModule } from '@mosaic/ui/alert';

import { AppComponent } from './app.component';
import { BaseDataService } from './base-data.service';
import { AppRoutingModule } from './app-routing.module';
import { MosDynamicControlModule } from './dynamic-control/dynamic-control.module';

@Injectable()
export class FetchAdapter {
  constructor(private httpClient: HttpClient) {}

  fetch = async (
    input: Request | string,
    init: RequestInit
  ): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.url;
    const method =
      typeof input === 'string'
        ? init.method
          ? init.method
          : 'GET'
        : input.method;

    const result = await lastValueFrom(
      this.httpClient.request(method, url, {
        body: init.body,
        headers: init.headers as any,
        observe: 'response',
        responseType: 'json',
        withCredentials: true,
      })
    );

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      statusText: result.statusText,
    });
  };
}

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [ApolloModule,
        BrowserModule,
        MosDynamicControlModule,
        RouterModule.forRoot([]),
        OverlayHostComponent,
        MosDialogHostModule,
        MosDialogModule,
        MosAlertModule,
        AppRoutingModule], providers: [
        FetchAdapter,
        {
            provide: APOLLO_OPTIONS,
            useFactory() {
                return {
                    cache: new InMemoryCache(),
                    link: ApolloLink.from([
                        setContext(() => {
                            {
                                const headers: Record<string, string> = {};
                                headers['Apollo-Require-Preflight'] = 'true';
                                return { headers };
                            }
                        }),
                        createUploadLink({
                            uri: `http://localhost:3000/admin`,
                        }),
                    ]),
                };
            },
            deps: [HttpLink, FetchAdapter],
        },
        BaseDataService,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
