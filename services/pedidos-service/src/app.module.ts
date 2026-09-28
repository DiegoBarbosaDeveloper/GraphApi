import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosModule } from './pedidos.module';
import { Pedido } from './pedidos.model';
import { HealthController } from './health.controller';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || '/data/pedidos.db',
      entities: [Pedido],
      synchronize: true,
    }),
  ],
  controllers: [HealthController],
  providers: [PedidosModule],
})
export class AppModule {}
