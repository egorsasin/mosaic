import { Module } from '@nestjs/common';

import { MosCoreModule } from '@mosaic/core/core.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MosCoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
