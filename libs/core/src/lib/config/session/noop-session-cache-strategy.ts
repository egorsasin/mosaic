import { SessionCacheStrategy } from './session-cache-strategy';

export class NoopSessionCacheStrategy implements SessionCacheStrategy {
  public clear() {
    return undefined;
  }

  public delete() {
    return undefined;
  }

  public get() {
    return undefined;
  }

  public set() {
    return undefined;
  }
}
