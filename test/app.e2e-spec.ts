import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

interface Identificador {
  id: string;
}

describe('API GraphQL (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  async function ejecutar(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<Response> {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables })
      .expect(200);
  }

  it('publica GraphiQL fuera de producción', async () => {
    const response = await request(app.getHttpServer())
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);

    expect(response.text).toContain('GraphiQL');
  });

  it('permite ejecutar el CRUD completo con sus relaciones', async () => {
    const usuarioResponse = await ejecutar(
      `
        mutation CrearUsuario($input: CrearUsuarioInput!) {
          crearUsuario(input: $input) {
            id
            nombre
            email
            telefono
            activo
          }
        }
      `,
      {
        input: {
          nombre: 'María Pérez',
          email: 'maria@example.com',
          telefono: '+34 600 000 000',
        },
      },
    );
    const usuario = usuarioResponse.body.data.crearUsuario as Identificador;
    expect(usuarioResponse.body.errors).toBeUndefined();

    const ordenResponse = await ejecutar(
      `
        mutation CrearOrden($input: CrearOrdenInput!) {
          crearOrden(input: $input) {
            id
            estado
            usuarioId
            usuario {
              email
            }
            total
          }
        }
      `,
      { input: { usuarioId: usuario.id } },
    );
    const orden = ordenResponse.body.data.crearOrden as Identificador;

    const primerPedidoResponse = await ejecutar(
      `
        mutation CrearPedido($input: CrearPedidoInput!) {
          crearPedido(input: $input) {
            id
            producto
            cantidad
            precioUnitario
            subtotal
          }
        }
      `,
      {
        input: {
          producto: 'Comida para gatos',
          descripcion: 'Paquete premium',
          cantidad: 3,
          precioUnitario: 12.5,
          usuarioId: usuario.id,
          ordenId: orden.id,
        },
      },
    );
    const primerPedido = primerPedidoResponse.body.data
      .crearPedido as Identificador;

    const segundoPedidoResponse = await ejecutar(
      `
        mutation CrearSegundoPedido($input: CrearPedidoInput!) {
          crearSegundoPedido: crearPedido(input: $input) {
            id
            producto
            subtotal
          }
        }
      `,
      {
        input: {
          producto: 'Juguete',
          cantidad: 1,
          precioUnitario: 5,
          usuarioId: usuario.id,
          ordenId: orden.id,
        },
      },
    );
    const segundoPedido = segundoPedidoResponse.body.data
      .crearSegundoPedido as Identificador;

    const pagoResponse = await ejecutar(
      `
        mutation CrearPago($input: CrearPagoInput!) {
          crearPago(input: $input) {
            id
            monto
            metodo
            estado
          }
        }
      `,
      {
        input: {
          monto: 20,
          metodo: 'TARJETA',
          estado: 'APROBADO',
          referencia: 'REF-001',
          ordenId: orden.id,
        },
      },
    );
    const pago = pagoResponse.body.data.crearPago as Identificador;

    const consultaResponse = await ejecutar(
      `
        query OrdenCompleta($ordenId: ID!, $usuarioId: ID!) {
          orden(id: $ordenId) {
            id
            total
            estado
            usuarioId
            usuario {
              id
              email
            }
            pedidos {
              id
              producto
              cantidad
              subtotal
              usuario {
                email
              }
            }
            pagos {
              id
              monto
              estado
              orden {
                id
              }
            }
          }
          usuario(id: $usuarioId) {
            id
            pedidos {
              id
            }
            ordenes {
              id
            }
          }
          pedidos {
            id
          }
          pagos {
            id
          }
          pedidosPorUsuario: pedidos(usuarioId: $usuarioId) {
            id
          }
          pagosPorOrden: pagos(ordenId: $ordenId) {
            id
          }
          pedidosConFiltorNulo: pedidos(usuarioId: null) {
            id
          }
          pagosConFiltorNulo: pagos(ordenId: null) {
            id
          }
        }
      `,
      { ordenId: orden.id, usuarioId: usuario.id },
    );

    expect(consultaResponse.body.errors).toBeUndefined();
    expect(consultaResponse.body.data.orden.total).toBe(42.5);
    expect(consultaResponse.body.data.orden.usuarioId).toBe(usuario.id);
    expect(consultaResponse.body.data.orden.usuario.email).toBe(
      'maria@example.com',
    );
    expect(consultaResponse.body.data.orden.pedidos).toHaveLength(2);
    expect(consultaResponse.body.data.orden.pedidos[0].usuario.email).toBe(
      'maria@example.com',
    );
    expect(consultaResponse.body.data.orden.pagos[0].orden.id).toBe(orden.id);
    expect(consultaResponse.body.data.usuario.pedidos).toHaveLength(2);
    expect(consultaResponse.body.data.usuario.ordenes).toEqual([
      { id: orden.id },
    ]);
    expect(consultaResponse.body.data.pedidos).toHaveLength(2);
    expect(consultaResponse.body.data.pagos).toHaveLength(1);
    expect(consultaResponse.body.data.pedidosPorUsuario).toHaveLength(2);
    expect(consultaResponse.body.data.pagosPorOrden).toHaveLength(1);
    expect(consultaResponse.body.data.pedidosConFiltorNulo).toHaveLength(2);
    expect(consultaResponse.body.data.pagosConFiltorNulo).toHaveLength(1);

    const actualizacionResponse = await ejecutar(
      `
        mutation ActualizarEjemplo(
          $usuarioId: ID!
          $ordenId: ID!
          $pedidoId: ID!
          $pagoId: ID!
        ) {
          actualizarUsuario(
            id: $usuarioId
            input: { nombre: "María Actualizada", activo: false }
          ) {
            nombre
            activo
          }
          actualizarOrden(id: $ordenId, input: { estado: PAGADA }) {
            estado
          }
          actualizarPedido(
            id: $pedidoId
            input: { cantidad: 4 }
          ) {
            cantidad
            subtotal
          }
          actualizarPago(id: $pagoId, input: { monto: 55 }) {
            monto
          }
        }
      `,
      {
        usuarioId: usuario.id,
        ordenId: orden.id,
        pedidoId: primerPedido.id,
        pagoId: pago.id,
      },
    );

    expect(actualizacionResponse.body.errors).toBeUndefined();
    expect(actualizacionResponse.body.data.actualizarUsuario).toEqual({
      nombre: 'María Actualizada',
      activo: false,
    });

    const ordenActualizadaResponse = await ejecutar(
      `
        query OrdenActualizada($id: ID!) {
          orden(id: $id) {
            total
            estado
            pedidos {
              cantidad
            }
            pagos {
              monto
            }
          }
        }
      `,
      { id: orden.id },
    );

    expect(ordenActualizadaResponse.body.data.orden.total).toBe(55);
    expect(ordenActualizadaResponse.body.data.orden.estado).toBe('PAGADA');
    expect(ordenActualizadaResponse.body.data.orden.pedidos[0].cantidad).toBe(
      4,
    );
    expect(ordenActualizadaResponse.body.data.orden.pagos[0].monto).toBe(55);

    const eliminarConRelacionesResponse = await ejecutar(
      `
        mutation EliminarOrdenInvalida($id: ID!) {
          eliminarOrden(id: $id)
        }
      `,
      { id: orden.id },
    );
    expect(eliminarConRelacionesResponse.body.data).toBeNull();
    expect(eliminarConRelacionesResponse.body.errors[0].message).toContain(
      'pedidos asociados',
    );

    const eliminarDependenciasResponse = await ejecutar(
      `
        mutation EliminarRelaciones(
          $usuarioId: ID!
          $ordenId: ID!
          $pedidoId: ID!
          $segundoPedidoId: ID!
          $pagoId: ID!
        ) {
          eliminarPago(id: $pagoId)
          eliminarPedido(id: $pedidoId)
          eliminarSegundoPedido: eliminarPedido(id: $segundoPedidoId)
          eliminarOrden(id: $ordenId)
          eliminarUsuario(id: $usuarioId)
        }
      `,
      {
        usuarioId: usuario.id,
        ordenId: orden.id,
        pedidoId: primerPedido.id,
        segundoPedidoId: segundoPedido.id,
        pagoId: pago.id,
      },
    );

    expect(eliminarDependenciasResponse.body.errors).toBeUndefined();
    expect(eliminarDependenciasResponse.body.data).toEqual({
      eliminarPago: true,
      eliminarPedido: true,
      eliminarSegundoPedido: true,
      eliminarOrden: true,
      eliminarUsuario: true,
    });
  });

  it('rechaza emails duplicados y relaciones inexistentes', async () => {
    const crearUsuario = `
      mutation CrearUsuario($input: CrearUsuarioInput!) {
        crearUsuario(input: $input) {
          id
        }
      }
    `;
    const inputUsuario = {
      nombre: 'Usuario Uno',
      email: 'repetido@example.com',
    };

    await ejecutar(crearUsuario, { input: inputUsuario });
    const duplicadoResponse = await ejecutar(crearUsuario, {
      input: inputUsuario,
    });

    expect(duplicadoResponse.body.data).toBeNull();
    expect(duplicadoResponse.body.errors[0].message).toBe(
      'Ya existe un usuario con ese email.',
    );

    const nombreVacioResponse = await ejecutar(crearUsuario, {
      input: {
        nombre: '   ',
        email: 'vacio@example.com',
      },
    });
    expect(nombreVacioResponse.body.data).toBeNull();
    expect(nombreVacioResponse.body.errors[0].message).toContain('Bad Request');

    const usuarioResponse = await ejecutar(
      `
        query Usuarios {
          usuarios {
            id
          }
        }
      `,
    );
    const usuario = usuarioResponse.body.data.usuarios[0] as Identificador;
    const ordenResponse = await ejecutar(
      `
        mutation CrearOrden($input: CrearOrdenInput!) {
          crearOrden(input: $input) {
            id
          }
        }
      `,
      { input: { usuarioId: usuario.id } },
    );
    const orden = ordenResponse.body.data.crearOrden as Identificador;

    const productoVacioResponse = await ejecutar(
      `
        mutation CrearPedidoSinProducto($input: CrearPedidoInput!) {
          crearPedido(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          producto: '   ',
          cantidad: 1,
          precioUnitario: 10,
          usuarioId: usuario.id,
          ordenId: orden.id,
        },
      },
    );
    expect(productoVacioResponse.body.data).toBeNull();
    expect(productoVacioResponse.body.errors[0].message).toContain(
      'Bad Request',
    );

    const relacionInvalidaResponse = await ejecutar(
      `
        mutation CrearPedidoInvalido($input: CrearPedidoInput!) {
          crearPedido(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          producto: 'Producto huérfano',
          cantidad: 1,
          precioUnitario: 10,
          usuarioId: usuario.id,
          ordenId: randomUUID(),
        },
      },
    );

    expect(relacionInvalidaResponse.body.data).toBeNull();
    expect(relacionInvalidaResponse.body.errors[0].message).toContain(
      'Orden con id',
    );
    expect(orden.id).toBeDefined();
  });
});
