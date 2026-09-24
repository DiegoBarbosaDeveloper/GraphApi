import { randomUUID } from 'node:crypto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrdenesService } from '../ordenes/ordenes.service.js';
import { PedidosService } from '../pedidos/pedidos.service.js';
import { EstadoPago, MetodoPago } from '../pagos/pagos.model.js';
import { PagosService } from '../pagos/pagos.service.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { InMemoryStoreService } from './in-memory-store.service.js';

describe('Integridad de las relaciones', () => {
  const store = new InMemoryStoreService();
  const usuarios = new UsuariosService(store);
  const ordenes = new OrdenesService(store);
  const pedidos = new PedidosService(store);
  const pagos = new PagosService(store);

  const crearContexto = () => {
    const usuario = usuarios.create({
      nombre: 'Usuario de prueba',
      email: `integridad-${randomUUID()}@example.com`,
    });
    const orden = ordenes.create({ usuarioId: usuario.id });
    const pedido = pedidos.create({
      producto: 'Producto original',
      descripcion: 'Descripción original',
      cantidad: 2,
      precioUnitario: 10,
      usuarioId: usuario.id,
      ordenId: orden.id,
    });
    const pago = pagos.create({
      monto: 20,
      metodo: MetodoPago.TARJETA,
      estado: EstadoPago.APROBADO,
      referencia: 'ORIGINAL',
      ordenId: orden.id,
    });

    return { usuario, orden, pedido, pago };
  };

  it('impide pedidos de un usuario distinto al propietario', () => {
    const propietario = usuarios.create({
      nombre: 'Propietario',
      email: `propietario-${randomUUID()}@example.com`,
    });
    const otroUsuario = usuarios.create({
      nombre: 'Otro usuario',
      email: `otro-${randomUUID()}@example.com`,
    });
    const orden = ordenes.create({ usuarioId: propietario.id });

    expect(() =>
      pedidos.create({
        producto: 'Producto inválido',
        cantidad: 1,
        precioUnitario: 10,
        usuarioId: otroUsuario.id,
        ordenId: orden.id,
      }),
    ).toThrow(ConflictException);
    expect(() => usuarios.remove(propietario.id)).toThrow(ConflictException);
  });

  it('no muta un pedido cuando falla una relación en la actualización', () => {
    const { orden, pedido } = crearContexto();

    expect(() =>
      pedidos.update(pedido.id, {
        producto: 'Producto cambiado',
        cantidad: 9,
        ordenId: randomUUID(),
      }),
    ).toThrow(NotFoundException);

    expect(pedido.producto).toBe('Producto original');
    expect(pedido.cantidad).toBe(2);
    expect(pedido.subtotal).toBe(20);
    expect(pedido.ordenId).toBe(orden.id);
    expect(orden.total).toBe(20);
  });

  it('no muta un pago cuando falla una relación en la actualización', () => {
    const { orden, pago } = crearContexto();

    expect(() =>
      pagos.update(pago.id, {
        monto: 999,
        estado: EstadoPago.RECHAZADO,
        ordenId: randomUUID(),
      }),
    ).toThrow(NotFoundException);

    expect(pago.monto).toBe(20);
    expect(pago.estado).toBe(EstadoPago.APROBADO);
    expect(pago.referencia).toBe('ORIGINAL');
    expect(pago.ordenId).toBe(orden.id);
  });

  it('recalcula las dos órdenes al mover un pedido', () => {
    const { orden: ordenOrigen, pedido } = crearContexto();
    const ordenDestino = ordenes.create({ usuarioId: pedido.usuarioId });

    pedidos.update(pedido.id, { ordenId: ordenDestino.id });

    expect(ordenOrigen.total).toBe(0);
    expect(ordenDestino.total).toBe(20);
  });
});
