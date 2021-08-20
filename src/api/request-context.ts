import { Request } from 'express';
import { CachedSession } from '../config';

export class RequestContext {
  private readonly _session?: CachedSession;

  constructor(options: { session?: CachedSession }) {
    const { session } = options;
    this._session = session;
  }

  public get session(): CachedSession {
    return this._session;
  }

  get activeUserId(): number | undefined {
    return this.session?.user?.id;
  }
}
