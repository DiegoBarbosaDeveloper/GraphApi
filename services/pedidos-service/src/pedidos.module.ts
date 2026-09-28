import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosResolver } from './pedidos.resolver';
import { Pedido } from './pedidos.model';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido])],
  providers: [PedidosService, PedidosResolver],
})
export class PedidosModule {}
