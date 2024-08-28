import { NgModule } from '@angular/core';

import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import {
  ApolloClientOptions,
  ApolloLink,
  InMemoryCache,
} from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { LocalStorageService } from '../services/local-storage.service';
import { environment } from './../../environments/environment';

import { APIS, DataService } from './api';
import { clientResolvers, GET_USER_STATUS } from './client';

const uri = environment.API_URL;

export function createApollo(
  httpLink: HttpLink,
  localStorageService: LocalStorageService
): ApolloClientOptions<unknown> {
  const cache = new InMemoryCache();

  cache.writeQuery({
    query: GET_USER_STATUS,
    data: {
      userStatus: {
        username: '',
        isLogedIn: false,
        loginTime: '',
      },
    },
  });

  return {
    link: ApolloLink.from([
      setContext(() => {
        const headers: Record<string, string> = {};
        const authToken = localStorageService.get('authToken');

        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        return { headers };
      }),
      httpLink.create({
        uri,
      }),
    ]),
    cache,
    connectToDevTools: true, // TODO only for dev
    resolvers: [clientResolvers],
  };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    ...APIS,
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, LocalStorageService],
    },
    DataService,
  ],
})
export class DataModule {}
