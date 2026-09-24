import { Injectable } from '@nestjs/common';
import { Orden } from '../ordenes/ordenes.model.js';
import { Pedido } from '../pedidos/pedidos.model.js';
import { Pago } from '../pagos/pagos.model.js';
import { Usuario } from '../usuarios/usuarios.model.js';

@Injectable()
export class InMemoryStoreService {
  readonly usuarios = new Map<string, Usuario>();
  readonly ordenes = new Map<string, Orden>();
  readonly pedidos = new Map<string, Pedido>();
  readonly pagos = new Map<string, Pago>();
}
