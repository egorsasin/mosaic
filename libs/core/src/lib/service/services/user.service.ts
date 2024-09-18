import { DataSource } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';

import { isEmailAddressLike, normalizeEmailAddress } from '@mosaic/common';

import { User, DATA_SOURCE_PROVIDER } from '../../data';
import { RequestContext } from '../../api';

@Injectable()
export class UserService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
  ) {}

  public async getUserById(id: number): Promise<User | undefined> {
    return this.dataSource
      .getRepository(User)
      .findOne({ where: { id }, relations: ['authenticationMethods'] });
  }

  public async getUserByEmailAddress(
    ctx: RequestContext,
    emailAddress: string,
    userType?: 'administrator' | 'customer'
  ): Promise<User | undefined> {
    // TODO: Авторизация в магазине
    const table = 'administrator';
    // const table =
    //   userType ?? (ctx.apiType === 'admin' ? 'administrator' : 'customer');

    const qb = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .innerJoin(table, table, `${table}.userId = user.id`)
      .leftJoinAndSelect('user.authenticationMethods', 'authenticationMethods')
      .where('user.deletedAt IS NULL');

    if (isEmailAddressLike(emailAddress)) {
      qb.andWhere('LOWER(user.identifier) = :identifier', {
        identifier: normalizeEmailAddress(emailAddress),
      });
    } else {
      qb.andWhere('user.identifier = :identifier', {
        identifier: emailAddress,
      });
    }

    return qb.getOne().then((result) => result ?? undefined);
  }
}
