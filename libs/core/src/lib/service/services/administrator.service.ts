import { Inject, Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';

import { Administrator, DATA_SOURCE_PROVIDER } from '../../data';
import { RelationPaths, RequestContext } from '../../api';

@Injectable()
export class AdministratorService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
  ) {}

  public findOneByUserId(
    ctx: RequestContext,
    userId: number,
    relations?: RelationPaths<Administrator>
  ): Promise<Administrator | undefined> {
    return this.dataSource
      .getRepository(Administrator)
      .findOne({
        relations,
        where: {
          user: { id: userId },
          deletedAt: IsNull(),
        },
      })
      .then((result) => result ?? undefined);
  }
}
