import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Response } from 'express';

import { ForbiddenError, NotVerifiedError } from '@mosaic/common';

import { UserService } from '../../service/services/user.service';
import { User } from '../../data';
import { Permission, RequestContext } from '../common';
import { Allow, Ctx } from '../decorators';
import { isGraphQlErrorResult } from '../../common';
import {
  AuthenticationResult,
  CurrentUser,
  MutationAuthenticateArgs,
} from '../../types';
import { ConfigService } from '../../config';
import { AuthService } from '../../service/services/auth.service';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  @Query()
  @Allow(Permission.Authenticated)
  public async me(@Ctx() ctx: RequestContext) {
    const userId = ctx.activeUserId;
    if (!userId) {
      throw new ForbiddenError();
    }
    const user = userId && (await this.userService.getUserById(userId));
    return user ? this.publiclyAccessibleUser(user) : null;
  }

  @Mutation()
  @Allow(Permission.Public)
  public async authenticate(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationAuthenticateArgs,
    @Context('res') res: Response
  ): Promise<AuthenticationResult> {
    return (await this.authenticateAndCreateSession(
      ctx,
      args,
      res
    )) as AuthenticationResult;
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
