import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { ConfigModule } from './config';
@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
