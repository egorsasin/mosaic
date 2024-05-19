import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ConfigModule, ConfigService } from '../config';

export const DATA_SOURCE_PROVIDER = 'DATA_SOURCE';

const dataSourceProvider = {
  provide: DATA_SOURCE_PROVIDER,
  useFactory: (configService: ConfigService) => {
    const { dbConnectionOptions } = configService;
    const dataSource = new DataSource(dbConnectionOptions);

    return dataSource.initialize();
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [dataSourceProvider],
  exports: [dataSourceProvider],
})
export class DataModule {}
