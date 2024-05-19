import { DocumentNode } from 'graphql';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { gql } from 'graphql-tag';

import { AuthenticationStrategy } from '@mosaic/core/config';
import { User } from '@mosaic/core/data';
import { Injector } from '@mosaic/core/api/common';
import { ExternalAuthenticationService } from '@mosaic/core/service/services';

export type GoogleAuthData = {
  token: string;
};

export class GoogleAuthenticationStrategy
  implements AuthenticationStrategy<GoogleAuthData>
{
  public readonly name = 'google';
  private authClient: OAuth2Client;
  private externalAuthenticationService: ExternalAuthenticationService;

  constructor(private clientId: string) {
    this.authClient = new OAuth2Client(clientId);
  }

  public init(injector: Injector) {
    this.externalAuthenticationService = injector.get(
      ExternalAuthenticationService
    );
  }

  public defineInputType(): DocumentNode {
    return gql`
      input GoogleAuthInput {
        token: String!
      }
    `;
  }

  public async authenticate(data: GoogleAuthData): Promise<User | false> {
    const ticket = await this.authClient.verifyIdToken({
      idToken: data.token,
      audience: this.clientId,
    });
    const payload: TokenPayload = ticket.getPayload();

    if (!payload || !payload.email) {
      return false;
    }

    const user = await this.externalAuthenticationService.findUser(
      this.name,
      payload.sub
    );

    if (user) {
      return user;
    }

    return this.externalAuthenticationService.createUser({
      strategy: this.name,
      externalIdentifier: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name,
      verified: payload.email_verified || false,
      emailAddress: payload.email,
    });
  }

  public onLogOut?(user: User): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
