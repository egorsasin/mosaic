import {
  NgModule,
  ModuleWithProviders,
  SkipSelf,
  Optional,
} from '@angular/core';
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HttpLink } from 'apollo-angular/http';
import { createUploadLink } from 'apollo-upload-client';

import { APIS } from './api';
import { FetchAdapter } from './fetch-adapter';

@NgModule({
  imports: [ApolloModule],
  providers: [
    ...APIS,
    FetchAdapter,
    provideHttpClient(withInterceptorsFromDi()),
  ],
  exports: [],
})
export class DataModule {
  public static forRoot(): ModuleWithProviders<DataModule> {
    return {
      ngModule: DataModule,
      providers: [
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
      ],
    };
  }

  constructor(
    @Optional() @SkipSelf() parentModule: DataModule,
    @Optional() http: HttpClient
  ) {
    if (parentModule) {
      throw new Error('DataModule is already loaded');
    }
    if (!http) {
      throw new Error(
        'You need to import the HttpClientModule in your AppModule! \n' +
          'See also https://github.com/angular/angular/issues/20575'
      );
    }
  }
}
