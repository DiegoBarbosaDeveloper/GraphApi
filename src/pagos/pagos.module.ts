import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module.js';
import { PagosService } from './pagos.service.js';

@Module({
  imports: [StoreModule],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
