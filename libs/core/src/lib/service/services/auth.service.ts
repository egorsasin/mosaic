import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { AuthenticationStrategy, ConfigService } from '../../config';
import { AuthenticatedSession, User } from '../../data';
import { InvalidCredentialsError, NotVerifiedError } from '../../common';
import { RequestContext } from '../../api/common';

import { UserService } from './user.service';
import { SessionService } from './session.service';

export function normalizeEmailAddress(input: string): string {
  return input.trim().toLowerCase();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  public async authenticate(
    ctx: RequestContext,
    authenticationMethod: string,
    authenticationData: any,
  ): Promise<AuthenticatedSession | InvalidCredentialsError | NotVerifiedError> {
    const authenticationStrategy = this.getAuthenticationStrategy(authenticationMethod);
    const authenticateResult = await authenticationStrategy.authenticate(authenticationData);

    if (typeof authenticateResult === 'string') {
      return new InvalidCredentialsError(authenticateResult);
    }
    if (!authenticateResult) {
      return new InvalidCredentialsError('');
    }

    return this.createAuthenticatedSessionForUser(ctx, authenticateResult, authenticationStrategy.name);
  }

  public async createAuthenticatedSessionForUser(
    ctx: RequestContext,
    user: User,
    authenticationStrategy: string,
  ): Promise<AuthenticatedSession | NotVerifiedError> {
    if (this.configService.authOptions.requireVerification && !user.verified) {
      return new NotVerifiedError();
    }

    if (ctx.session && ctx.session.activeOrderId) {
      await this.sessionService.deleteSessionsByActiveOrderId(ctx.session.activeOrderId);
    }

    const session = await this.sessionService.createNewAuthenticatedSession(
      ctx,
      user,
      authenticationStrategy,
    );

    return session;
  }

  // TODO private getAuthenticationStrategy(method: typeof NATIVE_AUTH_STRATEGY_NAME): NativeAuthenticationStrategy;
  private getAuthenticationStrategy(method: string): AuthenticationStrategy;
  private getAuthenticationStrategy(method: string): AuthenticationStrategy {
    const { authOptions } = this.configService;
    const strategies = authOptions.authenticationStrategy;
    const match = strategies.find((strategy: AuthenticationStrategy) => strategy.name === method);

    if (!match) {
      throw new InternalServerErrorException(`Unrecognized authentication strategy: ${method}`);
    }

    return match;
  }
}
