import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { DataSource } from 'typeorm';

import { RequestContext } from '../../api/common/request-context';
import {
  DATA_SOURCE_PROVIDER,
  NativeAuthenticationMethod,
  User,
} from '../../data';
import { Injector } from '../../api';

import { AuthenticationStrategy } from './authentication-strategy';

export interface NativeAuthenticationData {
  username: string;
  password: string;
}

export const NATIVE_AUTH_STRATEGY_NAME = 'native';

export class NativeAuthenticationStrategy
  implements AuthenticationStrategy<NativeAuthenticationData>
{
  readonly name = NATIVE_AUTH_STRATEGY_NAME;

  private connection: DataSource;
  private userService: import('../../service/services/user.service').UserService;
  private passwordCipher: import('../../service/helpers/password-cipher/password-cipher').PasswordCipher;

  public async init(injector: Injector) {
    this.connection = injector.get(DATA_SOURCE_PROVIDER);
    // These are lazily-loaded to avoid a circular dependency
    const { PasswordCipher } = await import(
      '../../service/helpers/password-cipher/password-cipher'
    );
    const { UserService } = await import('../../service/services/user.service');
    this.passwordCipher = injector.get(PasswordCipher);
    this.userService = injector.get(UserService);
  }

  public defineInputType(): DocumentNode {
    return gql`
      input NativeAuthInput {
        username: String!
        password: String!
      }
    `;
  }

  public async authenticate(
    ctx: RequestContext,
    data: NativeAuthenticationData
  ): Promise<User | false> {
    const user = await this.userService.getUserByEmailAddress(
      ctx,
      data.username
    );
    if (!user) {
      return false;
    }
    const passwordMatch = await this.verifyUserPassword(
      ctx,
      user.id,
      data.password
    );
    if (!passwordMatch) {
      return false;
    }
    return user;
  }

  /**
   * Verify the provided password against the one we have for the given user.
   */
  async verifyUserPassword(
    ctx: RequestContext,
    userId: number,
    password: string
  ): Promise<boolean> {
    const user = await this.connection.getRepository(User).findOne({
      where: { id: userId },
      relations: ['authenticationMethods'],
    });
    if (!user) {
      return false;
    }
    const nativeAuthMethod = user.getNativeAuthenticationMethod(false);
    if (!nativeAuthMethod) {
      return false;
    }

    const pw =
      (
        await this.connection
          .getRepository(NativeAuthenticationMethod)
          .findOne({
            where: { id: nativeAuthMethod.id },
            select: ['passwordHash'],
          })
      )?.passwordHash ?? '';
    const passwordMatches = await this.passwordCipher.check(password, pw);

    return !!passwordMatches;
  }
}
