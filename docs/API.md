# Referencia de la API GraphQL

Endpoint: `POST /graphql`

GraphiQL: `http://localhost:3000/graphql` fuera de producción.

El endpoint auxiliar `GET /` devuelve `Hello World!`; no forma parte de la API de dominio.

Contrato generado: [`schema.gql`](schema.gql).

## Convenciones

- Los ids se representan como `ID` y se generan como UUID v4.
- Las fechas usan el scalar `DateTime`, con formato ISO 8601 UTC.
- Los importes y precios usan `Float` y se redondean a dos decimales.
- Las listas se devuelven completas, sin paginación ni ordenamiento.
- Los errores de ejecución se devuelven en el array GraphQL `errors`.
- Los resolvers lanzan `NotFoundException`, `ConflictException` o `BadRequestException` según corresponda.
- Los campos de relación se resuelven dinámicamente mediante `@ResolveField`.

## Tipos de salida

### Usuario

```graphql
type Usuario {
  id: ID!
  nombre: String!
  email: String!
  telefono: String
  activo: Boolean!
  pedidos: [Pedido!]!
  ordenes: [Orden!]!
  creadoEn: DateTime!
  actualizadoEn: DateTime!
}
```

- `pedidos` contiene los pedidos creados por el usuario.
- `ordenes` contiene las órdenes propiedad del usuario.
- `telefono` puede ser `null`.
- `activo` se crea en `true` y puede modificarse.

### Orden

```graphql
type Orden {
  id: ID!
  estado: EstadoOrden!
  usuarioId: ID!
  usuario: Usuario!
  total: Float!
  pedidos: [Pedido!]!
  pagos: [Pago!]!
  creadoEn: DateTime!
  actualizadoEn: DateTime!
}
```

- `usuario` es el propietario inmutable de la orden.
- `total` se calcula a partir de `pedidos.subtotal`.
- `pedidos` contiene todos los pedidos asociados a la orden.
- `pagos` contiene todos los pagos asociados a la orden.

### Pedido

```graphql
type Pedido {
  id: ID!
  producto: String!
  descripcion: String
  cantidad: Int!
  precioUnitario: Float!
  subtotal: Float!
  usuarioId: ID!
  usuario: Usuario!
  ordenId: ID!
  orden: Orden!
  creadoEn: DateTime!
  actualizadoEn: DateTime!
}
```

Un pedido representa una línea de producto.

- `descripcion` puede ser `null`.
- `subtotal` no se recibe desde el cliente.
- `usuarioId` debe coincidir con el propietario de `ordenId`.
- `precioUnitario`, `subtotal` y `total` se manejan con dos decimales; `cantidad` es un entero.

### Pago

```graphql
type Pago {
  id: ID!
  monto: Float!
  metodo: MetodoPago!
  estado: EstadoPago!
  referencia: String
  ordenId: ID!
  orden: Orden!
  creadoEn: DateTime!
  actualizadoEn: DateTime!
}
```

- `referencia` puede ser `null`.
- El pago siempre está asociado a una orden.
- El monto no se compara automáticamente con el total de la orden.

## Enumeraciones

### EstadoOrden

```graphql
enum EstadoOrden {
  PENDIENTE
  PAGADA
  COMPLETADA
  CANCELADA
}
```

- Si se omite al crear una orden, se usa `PENDIENTE`.
- Las transiciones entre estados no están automatizadas en este MVP.

### EstadoPago

```graphql
enum EstadoPago {
  PENDIENTE
  APROBADO
  RECHAZADO
  REEMBOLSADO
}
```

- Si se omite al crear un pago, se usa `PENDIENTE`.

### MetodoPago

```graphql
enum MetodoPago {
  TARJETA
  EFECTIVO
  TRANSFERENCIA
  OTRO
}
```

## Inputs de creación

### CrearUsuarioInput

```graphql
input CrearUsuarioInput {
  nombre: String!
  email: String!
  telefono: String
}
```

| Campo      | Reglas                                                       |
| ---------- | ------------------------------------------------------------ |
| `nombre`   | Obligatorio, no vacío, máximo 120 caracteres.                |
| `email`    | Obligatorio, formato de email, máximo 180 caracteres, único. |
| `telefono` | Opcional, máximo 30 caracteres.                              |

Valores por defecto:

```json
{
  "activo": true,
  "telefono": null
}
```

### CrearOrdenInput

```graphql
input CrearOrdenInput {
  usuarioId: ID!
  estado: EstadoOrden
}
```

| Campo       | Reglas                                        |
| ----------- | --------------------------------------------- |
| `usuarioId` | Obligatorio, UUID v4 de un usuario existente. |
| `estado`    | Opcional; por defecto `PENDIENTE`.            |

El propietario no puede modificarse posteriormente.

### CrearPedidoInput

```graphql
input CrearPedidoInput {
  producto: String!
  descripcion: String
  cantidad: Int!
  precioUnitario: Float!
  usuarioId: ID!
  ordenId: ID!
}
```

| Campo            | Reglas                                              |
| ---------------- | --------------------------------------------------- |
| `producto`       | Obligatorio, no vacío, máximo 160 caracteres.       |
| `descripcion`    | Opcional, máximo 500 caracteres.                    |
| `cantidad`       | Entero entre 1 y 100.000.                           |
| `precioUnitario` | Mayor que 0, máximo 100.000.000, hasta 2 decimales. |
| `usuarioId`      | Usuario propietario de la orden.                    |
| `ordenId`        | Orden existente.                                    |

Si `usuarioId` no coincide con el propietario de `ordenId`, la creación se rechaza.

### CrearPagoInput

```graphql
input CrearPagoInput {
  monto: Float!
  metodo: MetodoPago!
  estado: EstadoPago
  referencia: String
  ordenId: ID!
}
```

| Campo        | Reglas                                              |
| ------------ | --------------------------------------------------- |
| `monto`      | Mayor que 0, máximo 100.000.000, hasta 2 decimales. |
| `metodo`     | Obligatorio.                                        |
| `estado`     | Opcional; por defecto `PENDIENTE`.                  |
| `referencia` | Opcional, máximo 120 caracteres.                    |
| `ordenId`    | Obligatorio, orden existente.                       |

## Inputs de actualización

Todos los inputs de actualización solo modifican los campos enviados.

### ActualizarUsuarioInput

```graphql
input ActualizarUsuarioInput {
  nombre: String
  email: String
  telefono: String
  activo: Boolean
}
```

- `nombre`, `email` y `activo` no pueden enviarse como `null`.
- `telefono: null` elimina el teléfono.
- Una cadena vacía o solo espacios en `telefono` se convierte en `null`.

### ActualizarOrdenInput

```graphql
input ActualizarOrdenInput {
  estado: EstadoOrden
}
```

Solo se puede modificar el estado. El propietario es inmutable.

### ActualizarPedidoInput

```graphql
input ActualizarPedidoInput {
  producto: String
  descripcion: String
  cantidad: Int
  precioUnitario: Float
  usuarioId: ID
  ordenId: ID
}
```

- Se puede cambiar el producto, descripción, cantidad, precio o usuario.
- Se puede mover el pedido a otra orden.
- La combinación final de `usuarioId` y `ordenId` debe cumplir la regla de propietario.
- `descripcion: null` elimina la descripción.
- Una descripción vacía o solo espacios se convierte en `null`.

### ActualizarPagoInput

```graphql
input ActualizarPagoInput {
  monto: Float
  metodo: MetodoPago
  estado: EstadoPago
  referencia: String
  ordenId: ID
}
```

- Se puede mover el pago a otra orden existente.
- `referencia: null` elimina la referencia.
- Una referencia vacía o solo espacios se convierte en `null`.

## Consultas

### Usuarios

```graphql
type Query {
  usuarios: [Usuario!]!
  usuario(id: ID!): Usuario!
}
```

- `usuarios` devuelve todos los usuarios.
- `usuario` devuelve un usuario o falla si no existe.

### Órdenes

```graphql
type Query {
  ordenes: [Orden!]!
  orden(id: ID!): Orden!
}
```

- `ordenes` devuelve todas las órdenes.
- `orden` devuelve una orden o falla si no existe.

### Pedidos

```graphql
type Query {
  pedidos(usuarioId: ID, ordenId: ID): [Pedido!]!
  pedido(id: ID!): Pedido!
}
```

Los filtros pueden combinarse:

| Filtro      | Resultado                                  |
| ----------- | ------------------------------------------ |
| Ninguno     | Todos los pedidos.                         |
| `usuarioId` | Pedidos de ese usuario.                    |
| `ordenId`   | Pedidos de esa orden.                      |
| Ambos       | Pedidos que coinciden con usuario y orden. |

Omitir un filtro o enviarlo como `null` equivale a no aplicarlo.

### Pagos

```graphql
type Query {
  pagos(ordenId: ID): [Pago!]!
  pago(id: ID!): Pago!
}
```

- Sin `ordenId`, devuelve todos los pagos.
- Con `ordenId`, devuelve únicamente los pagos de esa orden.

## Mutaciones

### Usuarios

```graphql
crearUsuario(input: CrearUsuarioInput!): Usuario!
actualizarUsuario(id: ID!, input: ActualizarUsuarioInput!): Usuario!
eliminarUsuario(id: ID!): Boolean!
```

`eliminarUsuario` falla si el usuario tiene pedidos u órdenes asociadas.

### Órdenes

```graphql
crearOrden(input: CrearOrdenInput!): Orden!
actualizarOrden(id: ID!, input: ActualizarOrdenInput!): Orden!
eliminarOrden(id: ID!): Boolean!
```

`eliminarOrden` falla si la orden tiene pedidos o pagos asociados.

### Pedidos

```graphql
crearPedido(input: CrearPedidoInput!): Pedido!
actualizarPedido(id: ID!, input: ActualizarPedidoInput!): Pedido!
eliminarPedido(id: ID!): Boolean!
```

Al actualizar cantidad, precio u orden se recalculan los totales afectados.

### Pagos

```graphql
crearPago(input: CrearPagoInput!): Pago!
actualizarPago(id: ID!, input: ActualizarPagoInput!): Pago!
eliminarPago(id: ID!): Boolean!
```

## Cálculo de totales

```text
subtotalPedido = round(cantidad × precioUnitario, 2)
totalOrden = round(sumatoria de subtotales, 2)
```

El total se recalcula cuando:

- Se crea un pedido.
- Se actualizan cantidad o precio.
- Se mueve un pedido a otra orden.
- Se elimina un pedido.

## Otros comportamientos

- `Usuario.activo` es informativo en este MVP; no bloquea operaciones porque no hay autorización.
- No se valida la transición entre estados de órdenes o pagos.
- Una orden puede tener cero o varios pagos.
- `Pago.referencia` no tiene que ser única.
- El monto de los pagos no se compara con el total de la orden.
- `actualizadoEn` cambia al actualizar la entidad.
- `Orden.actualizadoEn` también cambia cuando se recalcula su total por cambios en pedidos.

## Normalización y errores

- `nombre`, `producto`, `email`, teléfonos, descripciones y referencias se recortan por sus extremos.
- Los campos obligatorios que quedan vacíos se rechazan.
- Los emails se almacenan en minúsculas.
- Los emails duplicados generan un error de conflicto.
- Las referencias entre entidades se validan antes de modificar una entidad.
- Los errores de validación y relaciones se incluyen en `errors` de la respuesta GraphQL.

## Alcance de seguridad y volumen

- No hay autenticación ni guards.
- No se comprueba el usuario autenticado porque no existe contexto de autenticación.
- No hay paginación ni limitación de tasa.
- No se debe considerar este MVP apropiado para exposición pública sin protecciones adicionales.
