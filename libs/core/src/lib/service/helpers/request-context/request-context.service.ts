import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { Request } from 'express';

import { CachedSession } from '../../../config';
import { ApiType, RequestContext } from '../../../api';
import { User } from '../../../data';

@Injectable()
export class RequestContextService {
  public async create(config: {
    req?: Request;
    apiType: ApiType;
    user?: User;
    activeOrderId?: number;
  }): Promise<RequestContext> {
    const { req, apiType, user, activeOrderId } = config;

    let session: CachedSession | undefined;
    if (user) {
      session = {
        user: {
          id: user.id,
          identifier: user.identifier,
          verified: user.verified,
        },
        id: 0,
        token: '__dummy_session_token__',
        expires: new Date(Date.now() + ms('1y')),
        cacheExpiry: ms('1y'),
        activeOrderId,
      };
    }

    return new RequestContext({
      req,
      session,
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      apiType,
    });
  }
}
