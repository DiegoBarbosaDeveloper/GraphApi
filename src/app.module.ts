import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GraphqlModule } from './graphql/graphql.module.js';

@Module({
  imports: [GraphqlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
