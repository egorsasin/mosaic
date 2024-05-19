import { CachedSession, SessionCacheStrategy } from './session-cache-strategy';

export class InMemorySessionCacheStrategy implements SessionCacheStrategy {
  private readonly cache = new Map<string, CachedSession>();
  private readonly cacheSize: number = 1000;

  constructor(cacheSize?: number) {
    if (cacheSize != null) {
      if (cacheSize < 1) {
        throw new Error(`cacheSize must be a positive integer`);
      }
      this.cacheSize = Math.round(cacheSize);
    }
  }

  public delete(token: string) {
    this.cache.delete(token);
  }

  public get(token: string) {
    const item = this.cache.get(token);
    if (item) {
      this.cache.delete(token);
      this.cache.set(token, item);
    }
    return item;
  }

  public set(session: CachedSession) {
    const { token } = session;
    this.cache.set(session.token, session);

    if (this.cache.has(token)) {
      this.cache.delete(token);
    } else if (this.cache.size === this.cacheSize) {
      this.cache.delete(this.first());
    }
    this.cache.set(token, session);
  }

  public clear() {
    this.cache.clear();
  }

  private first() {
    return this.cache.keys().next().value;
  }
}
