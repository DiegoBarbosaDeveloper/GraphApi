import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InMemoryStoreService } from '../store/in-memory-store.service.js';
import { ActualizarPedidoInput, CrearPedidoInput } from './pedidos.input.js';
import { Pedido } from './pedidos.model.js';

@Injectable()
export class PedidosService {
  constructor(private readonly store: InMemoryStoreService) {}

  findAll(usuarioId?: string, ordenId?: string): Pedido[] {
    return [...this.store.pedidos.values()].filter(
      (pedido) =>
        (usuarioId === undefined || pedido.usuarioId === usuarioId) &&
        (ordenId === undefined || pedido.ordenId === ordenId),
    );
  }

  findOne(id: string): Pedido {
    const pedido = this.store.pedidos.get(id);

    if (!pedido) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado.`);
    }

    return pedido;
  }

  findByUsuario(usuarioId: string): Pedido[] {
    return this.findAll(usuarioId);
  }

  findByOrden(ordenId: string): Pedido[] {
    return this.findAll(undefined, ordenId);
  }

  create(input: CrearPedidoInput): Pedido {
    const producto = this.normalizarTextoObligatorio(input.producto);
    const descripcion = this.normalizarTextoOpcional(input.descripcion);

    this.assertUsuarioExists(input.usuarioId);
    this.assertOrdenExists(input.ordenId);
    this.assertUsuarioEsPropietario(input.usuarioId, input.ordenId);

    const ahora = new Date();
    const pedido: Pedido = {
      id: randomUUID(),
      producto,
      descripcion,
      cantidad: input.cantidad,
      precioUnitario: input.precioUnitario,
      subtotal: this.calcularSubtotal(input.cantidad, input.precioUnitario),
      usuarioId: input.usuarioId,
      ordenId: input.ordenId,
      creadoEn: ahora,
      actualizadoEn: ahora,
    };

    this.store.pedidos.set(pedido.id, pedido);
    this.recalcularTotal(pedido.ordenId);
    return pedido;
  }

  update(id: string, input: ActualizarPedidoInput): Pedido {
    const pedido = this.findOne(id);
    const ordenIdAnterior = pedido.ordenId;
    const producto =
      input.producto === undefined
        ? undefined
        : this.normalizarTextoObligatorio(input.producto);
    const descripcion = this.normalizarTextoOpcional(input.descripcion);

    if (input.usuarioId !== undefined) {
      this.assertUsuarioExists(input.usuarioId);
    }

    if (input.ordenId !== undefined) {
      this.assertOrdenExists(input.ordenId);
    }

    if (input.usuarioId !== undefined || input.ordenId !== undefined) {
      this.assertUsuarioEsPropietario(
        input.usuarioId ?? pedido.usuarioId,
        input.ordenId ?? pedido.ordenId,
      );
    }

    const cambioAfectaTotal =
      input.cantidad !== undefined ||
      input.precioUnitario !== undefined ||
      input.ordenId !== undefined;

    if (producto !== undefined) {
      pedido.producto = producto;
    }

    if (descripcion !== undefined) {
      pedido.descripcion = descripcion;
    }

    if (input.cantidad !== undefined) {
      pedido.cantidad = input.cantidad;
    }

    if (input.precioUnitario !== undefined) {
      pedido.precioUnitario = input.precioUnitario;
    }

    if (input.usuarioId !== undefined) {
      pedido.usuarioId = input.usuarioId;
    }

    if (input.ordenId !== undefined) {
      pedido.ordenId = input.ordenId;
    }

    pedido.subtotal = this.calcularSubtotal(
      pedido.cantidad,
      pedido.precioUnitario,
    );
    pedido.actualizadoEn = new Date();

    if (cambioAfectaTotal && pedido.ordenId !== ordenIdAnterior) {
      this.recalcularTotal(ordenIdAnterior);
    }

    if (cambioAfectaTotal) {
      this.recalcularTotal(pedido.ordenId);
    }

    return pedido;
  }

  remove(id: string): boolean {
    const pedido = this.findOne(id);
    const eliminado = this.store.pedidos.delete(id);
    this.recalcularTotal(pedido.ordenId);
    return eliminado;
  }

  private normalizarTextoObligatorio(valor: string): string {
    const texto = valor.trim();

    if (!texto) {
      throw new BadRequestException('El producto no puede estar vacío.');
    }

    return texto;
  }

  private normalizarTextoOpcional(
    valor: string | null | undefined,
  ): string | null | undefined {
    if (valor === undefined || valor === null) {
      return valor;
    }

    return valor.trim() || null;
  }

  private assertUsuarioExists(usuarioId: string): void {
    if (!this.store.usuarios.has(usuarioId)) {
      throw new NotFoundException(`Usuario con id ${usuarioId} no encontrado.`);
    }
  }

  private assertOrdenExists(ordenId: string): void {
    if (!this.store.ordenes.has(ordenId)) {
      throw new NotFoundException(`Orden con id ${ordenId} no encontrada.`);
    }
  }

  private assertUsuarioEsPropietario(usuarioId: string, ordenId: string): void {
    const orden = this.store.ordenes.get(ordenId);

    if (!orden) {
      throw new NotFoundException(`Orden con id ${ordenId} no encontrada.`);
    }

    if (orden.usuarioId !== usuarioId) {
      throw new ConflictException(
        'El usuario del pedido debe ser el propietario de la orden.',
      );
    }
  }

  private calcularSubtotal(cantidad: number, precioUnitario: number): number {
    return Math.round(cantidad * precioUnitario * 100) / 100;
  }

  private recalcularTotal(ordenId: string): void {
    const orden = this.store.ordenes.get(ordenId);

    if (!orden) {
      return;
    }

    const total = this.findByOrden(ordenId).reduce(
      (suma, pedido) => suma + pedido.subtotal,
      0,
    );

    orden.total = Math.round(total * 100) / 100;
    orden.actualizadoEn = new Date();
  }
}
