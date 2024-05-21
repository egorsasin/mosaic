import { DataSource } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';

import { User, DATA_SOURCE_PROVIDER } from '../../data';

@Injectable()
export class UserService {
  constructor(@Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource) {}

  public async getUserById(id: number): Promise<User | undefined> {
    return this.dataSource.getRepository(User).findOne({ where: { id }, relations: ['authenticationMethods'] });
  }
}
