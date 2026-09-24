import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStoreService } from '../store/in-memory-store.service.js';
import { ActualizarPagoInput, CrearPagoInput } from './pagos.input.js';
import { EstadoPago, Pago } from './pagos.model.js';

@Injectable()
export class PagosService {
  constructor(private readonly store: InMemoryStoreService) {}

  findAll(ordenId?: string): Pago[] {
    return [...this.store.pagos.values()].filter(
      (pago) => ordenId === undefined || pago.ordenId === ordenId,
    );
  }

  findOne(id: string): Pago {
    const pago = this.store.pagos.get(id);

    if (!pago) {
      throw new NotFoundException(`Pago con id ${id} no encontrado.`);
    }

    return pago;
  }

  findByOrden(ordenId: string): Pago[] {
    return this.findAll(ordenId);
  }

  create(input: CrearPagoInput): Pago {
    this.assertOrdenExists(input.ordenId);

    const ahora = new Date();
    const pago: Pago = {
      id: randomUUID(),
      monto: input.monto,
      metodo: input.metodo,
      estado: input.estado ?? EstadoPago.PENDIENTE,
      referencia: input.referencia?.trim() || null,
      ordenId: input.ordenId,
      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    this.store.pagos.set(pago.id, pago);
    return pago;
  }

  update(id: string, input: ActualizarPagoInput): Pago {
    const pago = this.findOne(id);

    if (input.ordenId !== undefined) {
      this.assertOrdenExists(input.ordenId);
    }

    if (input.monto !== undefined) {
      pago.monto = input.monto;
    }

    if (input.metodo !== undefined) {
      pago.metodo = input.metodo;
    }

    if (input.estado !== undefined) {
      pago.estado = input.estado;
    }

    if (input.referencia !== undefined) {
      pago.referencia = input.referencia?.trim() || null;
    }

    if (input.ordenId !== undefined) {
      pago.ordenId = input.ordenId;
    }

    pago.actualizadoEn = new Date();
    return pago;
  }

  remove(id: string): boolean {
    this.findOne(id);
    return this.store.pagos.delete(id);
  }

  private assertOrdenExists(ordenId: string): void {
    if (!this.store.ordenes.has(ordenId)) {
      throw new NotFoundException(`Orden con id ${ordenId} no encontrada.`);
    }
  }
}
