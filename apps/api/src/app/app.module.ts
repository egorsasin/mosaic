import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { MosCoreModule } from '@mosaic/core/core.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MosCoreModule, NestConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
