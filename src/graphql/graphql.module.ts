import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { OrdenesModule } from '../ordenes/ordenes.module.js';
import { PedidosModule } from '../pedidos/pedidos.module.js';
import { PagosModule } from '../pagos/pagos.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { OrdenesResolver } from './ordenes.resolver.js';
import { PedidosResolver } from './pedidos.resolver.js';
import { PagosResolver } from './pagos.resolver.js';
import { UsuariosResolver } from './usuarios.resolver.js';

const esProduccion =
  process.env.NODE_ENV === 'production' ||
  process.env.npm_lifecycle_event === 'start:prod';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      graphiql: !esProduccion,
      introspection: !esProduccion,
      includeStacktraceInErrorResponses: !esProduccion,
    }),
    UsuariosModule,
    OrdenesModule,
    PedidosModule,
    PagosModule,
  ],
  providers: [
    UsuariosResolver,
    PedidosResolver,
    OrdenesResolver,
    PagosResolver,
  ],
})
export class GraphqlModule {}
