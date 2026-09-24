import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InMemoryStoreService } from '../store/in-memory-store.service.js';
import { ActualizarOrdenInput, CrearOrdenInput } from './ordenes.input.js';
import { EstadoOrden, Orden } from './ordenes.model.js';

@Injectable()
export class OrdenesService {
  constructor(private readonly store: InMemoryStoreService) {}

  findAll(): Orden[] {
    return [...this.store.ordenes.values()];
  }

  findByUsuario(usuarioId: string): Orden[] {
    return this.findAll().filter((orden) => orden.usuarioId === usuarioId);
  }

  findOne(id: string): Orden {
    const orden = this.store.ordenes.get(id);

    if (!orden) {
      throw new NotFoundException(`Orden con id ${id} no encontrada.`);
    }

    return orden;
  }

  create(input: CrearOrdenInput): Orden {
    this.assertUsuarioExists(input.usuarioId);

    const ahora = new Date();
    const orden: Orden = {
      id: randomUUID(),
      estado: input.estado ?? EstadoOrden.PENDIENTE,
      usuarioId: input.usuarioId,
      total: 0,
      pedidos: [],
      pagos: [],
      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    this.store.ordenes.set(orden.id, orden);
    return orden;
  }

  update(id: string, input: ActualizarOrdenInput): Orden {
    const orden = this.findOne(id);

    if (input.estado !== undefined) {
      orden.estado = input.estado;
    }

    orden.actualizadoEn = new Date();
    return orden;
  }

  remove(id: string): boolean {
    this.findOne(id);

    if (this.tienePedidos(id)) {
      throw new ConflictException(
        'No se puede eliminar una orden que tiene pedidos asociados.',
      );
    }

    if (this.tienePagos(id)) {
      throw new ConflictException(
        'No se puede eliminar una orden que tiene pagos asociados.',
      );
    }

    return this.store.ordenes.delete(id);
  }

  private assertUsuarioExists(usuarioId: string): void {
    if (!this.store.usuarios.has(usuarioId)) {
      throw new NotFoundException(
        `Usuario propietario con id ${usuarioId} no encontrado.`,
      );
    }
  }

  private tienePedidos(ordenId: string): boolean {
    return [...this.store.pedidos.values()].some(
      (pedido) => pedido.ordenId === ordenId,
    );
  }

  private tienePagos(ordenId: string): boolean {
    return [...this.store.pagos.values()].some(
      (pago) => pago.ordenId === ordenId,
    );
  }
}
