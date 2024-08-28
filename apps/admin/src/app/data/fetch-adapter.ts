import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

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
