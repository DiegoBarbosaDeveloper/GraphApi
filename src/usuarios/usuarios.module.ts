import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module.js';
import { UsuariosService } from './usuarios.service.js';

@Module({
  imports: [StoreModule],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
