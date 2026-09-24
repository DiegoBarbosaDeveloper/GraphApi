import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module.js';
import { OrdenesService } from './ordenes.service.js';

@Module({
  imports: [StoreModule],
  providers: [OrdenesService],
  exports: [OrdenesService],
})
export class OrdenesModule {}
