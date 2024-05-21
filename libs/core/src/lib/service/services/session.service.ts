import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import ms from 'ms';
import { randomBytes } from 'crypto';

import { AnonymousSession, AuthenticatedSession, Order, Session, User, DATA_SOURCE_PROVIDER } from '../../data';
import { CachedSession, ConfigService, SessionCacheStrategy } from '../../config';
import { RequestContext } from '../../api/common';

import { OrderService } from './order.service';

const SESSION_CACHE_TIMEOUT_MS = 50;

@Injectable()
export class SessionService {
  private sessionCacheStrategy: SessionCacheStrategy;
  private readonly sessionDurationInMs: number;

  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService
  ) {
    this.sessionCacheStrategy = this.configService.authOptions.sessionCacheStrategy;
    this.sessionDurationInMs = ms(this.configService.authOptions.sessionDuration as string);
  }

  async getSessionFromToken(sessionToken: string): Promise<CachedSession | undefined> {
    let serializedSession = await this.sessionCacheStrategy.get(sessionToken);
    const stale = !!(serializedSession && serializedSession.cacheExpiry < new Date().getTime() / 1000);
    const expired = !!(serializedSession && serializedSession.expires < new Date());

    if (!serializedSession || stale || expired) {
      const session = await this.findSessionByToken(sessionToken);
      if (session) {
        serializedSession = this.serializeSession(session);
        await this.sessionCacheStrategy.set(serializedSession);
        return serializedSession;
      } else {
        return;
      }
    }

    return serializedSession;
  }

  public async deleteSessionsByActiveOrderId(activeOrderId: number): Promise<void> {
    const sessions = await this.dataSource
      .getRepository(Session)
      .find({ where: { activeOrder: { id: activeOrderId } } });

    await this.dataSource.getRepository(Session).remove(sessions);

    for (const session of sessions) {
      await this.sessionCacheStrategy.delete(session.token);
    }
  }

  async createAnonymousSession(): Promise<CachedSession> {
    const token = await this.generateSessionToken();
    const session = new AnonymousSession({
      token,
      expires: this.getExpiryDate(this.sessionDurationInMs),
      invalidated: false,
    });
    const newSession = await this.dataSource.getRepository(AnonymousSession).save(session);
    const serializedSession = this.serializeSession(newSession);

    await this.sessionCacheStrategy.set(serializedSession);

    return serializedSession;
  }

  public async createNewAuthenticatedSession(
    ctx: RequestContext,
    user: User,
    authenticationStrategy: string
  ): Promise<AuthenticatedSession> {
    const token = await this.generateSessionToken();
    const guestOrder =
      ctx.session && ctx.session.activeOrderId ? await this.orderService.findOne(ctx.session.activeOrderId) : undefined;
    const existingOrder = await this.orderService.getActiveOrderForUser(user.id);
    const activeOrder = guestOrder || existingOrder;
    const authenticatedSession = await this.dataSource.getRepository(AuthenticatedSession).save(
      new AuthenticatedSession({
        token,
        user,
        activeOrder,
        authenticationStrategy,
        expires: this.getExpiryDate(this.sessionDurationInMs),
        invalidated: false,
      })
    );

    await this.sessionCacheStrategy.set(this.serializeSession(authenticatedSession));

    return authenticatedSession;
  }

  public async setActiveOrder(serializedSession: CachedSession, order: Order): Promise<CachedSession> {
    const session = await this.dataSource.getRepository(Session).findOne({
      where: { id: serializedSession.id },
      relations: ['user'],
    });
    if (session) {
      session.activeOrder = order;
      await this.dataSource.getRepository(Session).save(session, {
        reload: false,
      });
      const updatedSerializedSession = this.serializeSession(session);
      await this.withTimeout(this.sessionCacheStrategy.set(updatedSerializedSession));
      return updatedSerializedSession;
    }
    return serializedSession;
  }

  private async findSessionByToken(token: string): Promise<Session | undefined> {
    const session = await this.dataSource.getRepository(Session).findOne({
      where: { token, invalidated: false },
      relations: ['user'],
    });

    if (session && session.expires > new Date()) {
      await this.updateSessionExpiry(session);
      return session;
    }
  }

  private async updateSessionExpiry(session: Session) {
    const now = new Date().getTime();
    if (session.expires.getTime() - now < this.sessionDurationInMs / 2) {
      const newExpiryDate = this.getExpiryDate(this.sessionDurationInMs);
      session.expires = newExpiryDate;
      await this.dataSource.getRepository(Session).update({ id: session.id }, { expires: newExpiryDate });
    }
  }

  private serializeSession(session: AuthenticatedSession | AnonymousSession): CachedSession {
    const expiry = Math.floor(new Date().getTime() / 1000) + this.configService.authOptions.sessionCacheTTL;
    const { token, expires, id, activeOrderId } = session;
    const serializedSession: CachedSession = {
      token,
      expires,
      id,
      activeOrderId,
      cacheExpiry: expiry,
    };
    if (this.isAuthenticatedSession(session)) {
      serializedSession.authenticationStrategy = session.authenticationStrategy;
      const { user } = session;
      serializedSession.user = {
        id: user.id,
        identifier: user.identifier,
        verified: user.verified,
      };
    }
    return serializedSession;
  }

  private generateSessionToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      randomBytes(32, (err, buf) => {
        if (err) {
          reject(err);
        }
        resolve(buf.toString('hex'));
      });
    });
  }

  private getExpiryDate(timeToExpireInMs: number): Date {
    return new Date(Date.now() + timeToExpireInMs);
  }

  /**
   * If the session cache is taking longer than say 50ms then something is wrong - it is supposed to
   * be very fast after all! So we will return undefined and let the request continue without a cached session.
   */
  private withTimeout<T>(maybeSlow: Promise<T> | T): Promise<T | undefined> {
    return Promise.race([
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), SESSION_CACHE_TIMEOUT_MS)),
      maybeSlow,
    ]);
  }

  private isAuthenticatedSession(session: Session): session is AuthenticatedSession {
    return session.hasOwnProperty('user');
  }
}
