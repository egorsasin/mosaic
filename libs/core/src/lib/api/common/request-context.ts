import { Request } from 'express';

import { User } from '../../data';
import { CachedSession } from '../../config/';

export class RequestContext {
  private readonly _req?: Request;
  private readonly _user?: User;
  private readonly _isAuthorized?: boolean;
  private readonly _authorizedAsOwnerOnly?: boolean;
  private readonly _session?: CachedSession;

  constructor(options: {
    req?: Request;
    isAuthorized?: boolean;
    authorizedAsOwnerOnly?: boolean;
    session?: CachedSession;
  }) {
    const { req, isAuthorized, authorizedAsOwnerOnly, session } = options;

    this._req = req;
    this._isAuthorized = isAuthorized;
    this._session = session;
    this._authorizedAsOwnerOnly = authorizedAsOwnerOnly;
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
}
