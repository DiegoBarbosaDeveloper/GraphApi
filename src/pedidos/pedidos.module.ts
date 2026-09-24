import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module.js';
import { PedidosService } from './pedidos.service.js';

@Module({
  imports: [StoreModule],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
