import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Response } from 'express';

import { NotVerifiedError } from '@mosaic/common';

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
import { User } from '../../../data';
import { isGraphQlErrorResult } from '../../../common';
import { ConfigService } from '../../../config';

export const NATIVE_AUTH_STRATEGY_NAME = 'native';

export class BaseAuthResolver {
  constructor(
    protected authService: AuthService,
    protected userService: UserService,
    protected configService: ConfigService
  ) {}

  /**
   * Attempts a login given the username and password of a user. If successful, returns
   * the user data and returns the token either in a cookie or in the response body.
   */
  async baseLogin(
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
    configService: ConfigService
  ) {
    super(authService, userService, configService);
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
