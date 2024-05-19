import { InjectableStrategy } from '../../common';

export type CachedSessionUser = {
  id: number;
  identifier: string;
  verified: boolean;
};

export type CachedSession = {
  token: string;
  cacheExpiry: number;
  expires: Date;
  id: number;
  activeOrderId?: number;
  authenticationStrategy?: string;
  user?: CachedSessionUser;
};

export interface SessionCacheStrategy extends InjectableStrategy {
  set(session: CachedSession): void | Promise<void>;

  get(token: string): CachedSession | undefined | Promise<CachedSession | undefined>;

  delete(token: string): void | Promise<void>;

  clear(): void | Promise<void>;
}
