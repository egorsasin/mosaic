import {
  AuthenticationMethod,
  ExternalAuthenticationMethod,
  User,
} from '@mosaic/core/data';
import { DATA_SOURCE_PROVIDER } from '@mosaic/core/data/data.module';
import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ExternalAuthenticationService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
  ) {}

  async findUser(
    strategy: string,
    externalIdentifier: string
  ): Promise<User | undefined> {
    const usersWithMatchingIdentifier = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.authenticationMethods', 'authMethod')
      .andWhere('authMethod.externalIdentifier = :externalIdentifier', {
        externalIdentifier,
      })
      .andWhere('user.deletedAt IS NULL')
      .getMany();

    const matchingUser = usersWithMatchingIdentifier.find((user) =>
      user.authenticationMethods.find(
        (method: AuthenticationMethod) =>
          method instanceof ExternalAuthenticationMethod &&
          method.strategy === strategy
      )
    );

    return matchingUser;
  }

  public async createUser(config: {
    strategy: string;
    externalIdentifier: string;
    firstName: string;
    lastName: string;
    verified: boolean;
    emailAddress: string;
  }): Promise<User> {
    let user: User;

    const existingUser = await this.findExistingUserByIdentifier(
      config.emailAddress
    );

    if (existingUser) {
      user = existingUser;
    } else {
      user = new User({
        identifier: config.emailAddress,
        verified: config.verified || false,
        authenticationMethods: [],
      });
    }

    const authMethod = await this.dataSource
      .getRepository(ExternalAuthenticationMethod)
      .save(
        new ExternalAuthenticationMethod({
          externalIdentifier: config.externalIdentifier,
          strategy: config.strategy,
        })
      );

    user.authenticationMethods = [
      ...(user.authenticationMethods || []),
      authMethod,
    ];
    return await this.dataSource.getRepository(User).save(user);
  }

  private async findExistingUserByIdentifier(
    identifier: string
  ): Promise<User | undefined> {
    return await this.dataSource
      .getRepository(User)
      .findOne({
        where: { identifier, deletedAt: null },
        relations: ['authenticationMethods'],
      });
  }
}
