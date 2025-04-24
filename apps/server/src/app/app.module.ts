import { Module } from '@nestjs/common';
import { AppController, TSPController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, TSPController],
  providers: [AppService],
})
export class AppModule {}
