import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { DATA_SOURCE_PROVIDER } from './constants';

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
