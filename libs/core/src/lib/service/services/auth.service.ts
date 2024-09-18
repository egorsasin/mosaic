import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { InvalidCredentialsError, NotVerifiedError } from '@mosaic/common';

import { ConfigService, AuthenticationStrategy } from '../../config';
import { AuthenticatedSession, User } from '../../data';
import { ErrorResultUnion } from '../../common';
import { RequestContext } from '../../api/common';
import {
  NATIVE_AUTH_STRATEGY_NAME,
  NativeAuthenticationStrategy,
} from '../../config/auth/native-authentication-strategy';

import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService
  ) {}

  public async authenticate(
    ctx: RequestContext,
    authenticationMethod: string,
    authenticationData: any
  ): Promise<
    ErrorResultUnion<
      InvalidCredentialsError | NotVerifiedError,
      AuthenticatedSession
    >
  > {
    const authenticationStrategy =
      this.getAuthenticationStrategy(authenticationMethod);
    const authenticateResult = await authenticationStrategy.authenticate(
      ctx,
      authenticationData
    );

    if (typeof authenticateResult === 'string') {
      return new InvalidCredentialsError(authenticateResult);
    }
    if (!authenticateResult) {
      return new InvalidCredentialsError('');
    }

    return this.createAuthenticatedSessionForUser(
      ctx,
      authenticateResult,
      authenticationStrategy.name
    );
  }

  public async createAuthenticatedSessionForUser(
    ctx: RequestContext,
    user: User,
    authenticationStrategy: string
  ): Promise<AuthenticatedSession | NotVerifiedError> {
    if (this.configService.authOptions.requireVerification && !user.verified) {
      return new NotVerifiedError();
    }

    if (ctx.session && ctx.session.activeOrderId) {
      await this.sessionService.deleteSessionsByActiveOrderId(
        ctx.session.activeOrderId
      );
    }

    const session = await this.sessionService.createNewAuthenticatedSession(
      ctx,
      user,
      authenticationStrategy
    );

    return session;
  }

  private getAuthenticationStrategy(
    method: typeof NATIVE_AUTH_STRATEGY_NAME
  ): NativeAuthenticationStrategy;
  private getAuthenticationStrategy(method: string): AuthenticationStrategy;
  private getAuthenticationStrategy(method: string): AuthenticationStrategy {
    const { authOptions } = this.configService;
    const strategies = authOptions.authenticationStrategy;
    const match = strategies.find(
      (strategy: AuthenticationStrategy) => strategy.name === method
    );

    if (!match) {
      throw new InternalServerErrorException(
        `Unrecognized authentication strategy: ${method}`
      );
    }

    return match;
  }
}
