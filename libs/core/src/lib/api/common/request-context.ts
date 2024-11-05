import { Request } from 'express';
import { TFunction } from 'i18next';

import { User } from '../../data';
import { CachedSession } from '../../config/';
import { ApiType } from '../types';

export class RequestContext {
  private readonly _req?: Request;
  private readonly _user?: User;
  private readonly _isAuthorized?: boolean;
  private readonly _authorizedAsOwnerOnly?: boolean;
  private readonly _session?: CachedSession;
  private readonly _apiType?: ApiType;
  private readonly _translationFn: TFunction;

  constructor(options: {
    req?: Request;
    isAuthorized?: boolean;
    authorizedAsOwnerOnly?: boolean;
    session?: CachedSession;
    apiType?: ApiType;
    translationFn?: TFunction;
  }) {
    const {
      req,
      isAuthorized,
      authorizedAsOwnerOnly,
      session,
      apiType,
      translationFn,
    } = options;

    this._req = req;
    this._isAuthorized = isAuthorized;
    this._session = session;
    this._authorizedAsOwnerOnly = authorizedAsOwnerOnly;
    this._apiType = apiType;
    this._translationFn = translationFn || (((key: string) => key) as any);
  }

  /**
   * @description
   * The raw Express request object.
   */
  public get req(): Request | undefined {
    return this._req;
  }

  public get activeUserId(): number | undefined {
    return this._session.user?.id;
  }

  public get isAuthorized(): boolean {
    return this._isAuthorized;
  }

  public get authorizedAsOwnerOnly(): boolean {
    return this._authorizedAsOwnerOnly;
  }

  public get session(): CachedSession | undefined {
    return this._session;
  }

  public get apiType(): ApiType {
    return this._apiType;
  }

  public translate(key: string, variables?: { [k: string]: any }): string {
    try {
      return this._translationFn(key, variables) as string;
    } catch (e: any) {
      return `Translation format error: ${JSON.stringify(
        e.message
      )}). Original key: ${key}`;
    }
  }
}
