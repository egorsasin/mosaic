import {
  NgModule,
  ModuleWithProviders,
  SkipSelf,
  Optional,
} from '@angular/core';
import {
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';

import { omit } from '@mosaic/common';

import { APIS } from './api';
import { FetchAdapter } from './fetch-adapter';
import { defaultInterceptor } from './default.interceptor';
import { LocalStorageService } from '../providers';

export class OmitTypenameLink extends ApolloLink {
  constructor() {
    super((operation, forward) => {
      if (operation.variables) {
        operation.variables = omit(operation.variables, ['__typename'], true);
      }

      return forward ? forward(operation) : null;
    });
  }
}

@NgModule({
  imports: [ApolloModule],
  providers: [...APIS, FetchAdapter],
  exports: [],
})
export class DataModule {
  public static forRoot(): ModuleWithProviders<DataModule> {
    return {
      ngModule: DataModule,
      providers: [
        provideHttpClient(withFetch(), withInterceptors([defaultInterceptor])),
        {
          provide: APOLLO_OPTIONS,
          useFactory(
            fetchAdapter: FetchAdapter,
            localStorage: LocalStorageService
          ) {
            return {
              cache: new InMemoryCache(),
              link: ApolloLink.from([
                new OmitTypenameLink(),
                setContext(() => {
                  const headers: Record<string, string> = {};
                  const authToken = localStorage.get('authToken');

                  if (authToken) {
                    headers['authorization'] = `Bearer ${authToken}`;
                  }

                  headers['Apollo-Require-Preflight'] = 'true';

                  return { headers };
                }),
                createUploadLink({
                  uri: `http://localhost:3000/admin`,
                  fetch: fetchAdapter.fetch as any,
                }),
              ]),
            };
          },
          deps: [FetchAdapter, LocalStorageService],
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
