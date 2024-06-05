import { GraphQLResolveInfo } from 'graphql';
import { Request, Response } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ForbiddenError } from '@mosaic/common';

import { SessionService } from '../../service/services';
import { CachedSession, ConfigService } from '../../config';

import {
  parseContext,
  Permission,
  PERMISSIONS_METADATA_KEY,
  RequestContext,
  REQUEST_CONTEXT_KEY,
} from '../common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res, info } = parseContext(context);
    const isFieldResolver = this.isFieldResolver(info);
    const permissions = this.reflector.get<Permission[]>(
      PERMISSIONS_METADATA_KEY,
      context.getHandler()
    );

    if (isFieldResolver && !permissions) {
      return true;
    }

    const authDisabled = this.configService.authOptions.disableAuth;
    const isPublic = permissions?.includes(Permission.Public);
    const hasOwnerPermission =
      !!permissions && permissions.includes(Permission.Owner);

    let requestContext: RequestContext;

    if (isFieldResolver) {
      requestContext = (req as any)[REQUEST_CONTEXT_KEY];
    } else {
      const session = await this.getSession(req, res, hasOwnerPermission);
      requestContext = await this.fromRequest(req, permissions, session);

      (req as any)[REQUEST_CONTEXT_KEY] = requestContext;
    }

    if (authDisabled || !permissions || isPublic) {
      return true;
    } else {
      const canActivate =
        requestContext.isAuthorized || requestContext.authorizedAsOwnerOnly;
      if (!canActivate) {
        throw new ForbiddenError();
      } else {
        return canActivate;
      }
    }
  }

  private isFieldResolver(info?: GraphQLResolveInfo): boolean {
    if (!info) {
      return false;
    }
    const parentType = info?.parentType?.name;
    return parentType !== 'Query' && parentType !== 'Mutation';
  }

  private async getSession(
    req: Request,
    res: Response,
    hasOwnerPermission: boolean
  ): Promise<CachedSession | undefined> {
    const authOtions = this.configService.authOptions;
    const sessionToken = extractAuthToken(req);

    let serializedSession: CachedSession | undefined;

    if (sessionToken) {
      serializedSession = await this.sessionService.getSessionFromToken(
        sessionToken
      );
      if (serializedSession) {
        return serializedSession;
      }

      res.set(authOtions.authTokenHeaderKey, '');
    }

    if (hasOwnerPermission && !serializedSession) {
      serializedSession = await this.sessionService.createAnonymousSession();
      res.set(authOtions.authTokenHeaderKey, serializedSession.token);
    }
    return serializedSession;
  }

  private async fromRequest(
    req: Request,
    requiredPermissions?: Permission[],
    session?: CachedSession
  ): Promise<RequestContext> {
    const authorizedAsOwnerOnly =
      !!requiredPermissions && requiredPermissions.includes(Permission.Owner);
    const user = session && session.user;
    const isAuthorized = !!user && user.verified;

    return new RequestContext({
      req,
      session,
      isAuthorized,
      authorizedAsOwnerOnly,
    });
  }
}

export function extractAuthToken(req: Request): string | undefined {
  const tokenFromHeader = getFromHeader(req);
  return tokenFromHeader;
}

function getFromHeader(req: Request): string | undefined {
  const authHeader = req.get('Authorization');

  if (authHeader) {
    const matches = authHeader.trim().match(/^bearer\s(.+)$/i);
    if (matches) {
      return matches[1];
    }
  }
}
