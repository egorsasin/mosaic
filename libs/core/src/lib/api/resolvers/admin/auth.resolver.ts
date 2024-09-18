import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Response } from 'express';

import { ForbiddenError, NotVerifiedError } from '@mosaic/common';

import { Allow, Ctx } from '../../decorators';
import { Permission, RequestContext } from '../../common';
import {
  AuthenticationResult,
  CurrentUser,
  MutationAuthenticateArgs,
  MutationLoginArgs,
  NativeAuthenticationResult,
} from '../../../types';
import { AuthService } from '../../../service/services/auth.service';
import { UserService } from '../../../service/services/user.service';
import { AdministratorService } from '../../../service/services/administrator.service';
import { User } from '../../../data';
import { isGraphQlErrorResult } from '../../../common';
import { ConfigService, NATIVE_AUTH_STRATEGY_NAME } from '../../../config';
import { ApiType } from '../../types';

export class BaseAuthResolver {
  constructor(
    protected authService: AuthService,
    protected userService: UserService,
    protected configService: ConfigService,
    protected administratorService?: AdministratorService
  ) {}

  /**
   * Attempts a login given the username and password of a user. If successful, returns
   * the user data and returns the token either in a cookie or in the response body.
   */
  public async baseLogin(
    args: MutationLoginArgs,
    ctx: RequestContext,
    req: Request,
    res: Response
  ): Promise<AuthenticationResult | NotVerifiedError> {
    return await this.authenticateAndCreateSession(
      ctx,
      {
        input: { [NATIVE_AUTH_STRATEGY_NAME]: args },
      },
      res
    );
  }

  public async me(ctx: RequestContext, apiType: ApiType) {
    const userId = ctx.activeUserId;

    if (!userId) {
      throw new ForbiddenError();
    }

    if (apiType === 'admin') {
      const administrator = await this.administratorService?.findOneByUserId(
        ctx,
        userId
      );
      if (!administrator) {
        throw new ForbiddenError();
      }
    }
    const user = userId && (await this.userService.getUserById(userId));

    return user ? this.publiclyAccessibleUser(user) : null;
  }

  private async authenticateAndCreateSession(
    ctx: RequestContext,
    args: MutationAuthenticateArgs,
    res: Response
  ): Promise<any | NotVerifiedError> {
    const [method, data] = Object.entries(args.input)[0];
    // method - строка с названием метода
    const session = await this.authService.authenticate(ctx, method, data);

    if (isGraphQlErrorResult(session)) {
      return session;
    }

    const { user, token } = session;
    const { authOptions } = this.configService;

    res.set(authOptions.authTokenHeaderKey, token);

    return this.publiclyAccessibleUser(user);
  }

  protected publiclyAccessibleUser(user: User): CurrentUser {
    return {
      id: user.id,
      identifier: user.identifier,
      verified: user.verified,
    };
  }
}

@Resolver()
export class AuthResolver extends BaseAuthResolver {
  constructor(
    authService: AuthService,
    userService: UserService,
    configService: ConfigService,
    administratorService: AdministratorService
  ) {
    super(authService, userService, configService, administratorService);
  }

  @Query()
  @Allow(Permission.Authenticated, Permission.Owner)
  me(@Ctx() ctx: RequestContext) {
    return super.me(ctx, 'admin');
  }

  @Mutation()
  @Allow(Permission.Public)
  async login(
    @Args() args: MutationLoginArgs,
    @Ctx() ctx: RequestContext,
    @Context('req') req: Request,
    @Context('res') res: Response
  ): Promise<NativeAuthenticationResult> {
    return (await super.baseLogin(args, ctx, req, res)) as AuthenticationResult;
  }
}
