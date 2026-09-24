# Ejemplos de GraphQL

Los ejemplos están pensados para ejecutarse desde GraphiQL en `http://localhost:3000/graphql`.

Los ids mostrados como `UUID_...` deben sustituirse por valores devueltos por operaciones anteriores.

## 1. Crear un usuario

```graphql
mutation CrearUsuario($input: CrearUsuarioInput!) {
  crearUsuario(input: $input) {
    id
    nombre
    email
    telefono
    activo
    creadoEn
  }
}
```

Variables:

```json
{
  "input": {
    "nombre": "María Pérez",
    "email": "maria@example.com",
    "telefono": "+34 600 000 000"
  }
}
```

Guardar el valor de `data.crearUsuario.id`.

## 2. Crear una orden con propietario

```graphql
mutation CrearOrden($input: CrearOrdenInput!) {
  crearOrden(input: $input) {
    id
    estado
    usuarioId
    total
    usuario {
      id
      nombre
      email
    }
  }
}
```

Variables:

```json
{
  "input": {
    "usuarioId": "UUID_DEL_USUARIO"
  }
}
```

El estado opcional puede enviarse como `PENDIENTE`, `PAGADA`, `COMPLETADA` o `CANCELADA`. Si se omite, la orden se crea como `PENDIENTE`.

## 3. Añadir varios pedidos a la orden

Los dos pedidos deben usar el mismo `usuarioId` que el propietario de la orden.

```graphql
mutation CrearPedidos(
  $primero: CrearPedidoInput!
  $segundo: CrearPedidoInput!
) {
  primero: crearPedido(input: $primero) {
    id
    producto
    cantidad
    precioUnitario
    subtotal
  }
  segundo: crearPedido(input: $segundo) {
    id
    producto
    cantidad
    precioUnitario
    subtotal
  }
}
```

Variables:

```json
{
  "primero": {
    "producto": "Comida para gatos",
    "descripcion": "Paquete premium",
    "cantidad": 2,
    "precioUnitario": 12.5,
    "usuarioId": "UUID_DEL_USUARIO",
    "ordenId": "UUID_DE_LA_ORDEN"
  },
  "segundo": {
    "producto": "Juguete",
    "cantidad": 1,
    "precioUnitario": 5,
    "usuarioId": "UUID_DEL_USUARIO",
    "ordenId": "UUID_DE_LA_ORDEN"
  }
}
```

Los subtotales son `25` y `5`; el total de la orden pasa a ser `30`.

## 4. Consultar la orden completa

```graphql
query ConsultarOrden($ordenId: ID!) {
  orden(id: $ordenId) {
    id
    estado
    total
    usuario {
      id
      nombre
      email
    }
    pedidos {
      id
      producto
      descripcion
      cantidad
      precioUnitario
      subtotal
      usuario {
        id
      }
    }
    pagos {
      id
      monto
      metodo
      estado
      referencia
    }
    creadoEn
    actualizadoEn
  }
}
```

Variables:

```json
{
  "ordenId": "UUID_DE_LA_ORDEN"
}
```

## 5. Registrar un pago

```graphql
mutation CrearPago($input: CrearPagoInput!) {
  crearPago(input: $input) {
    id
    monto
    metodo
    estado
    referencia
    ordenId
    orden {
      id
      total
    }
  }
}
```

Variables:

```json
{
  "input": {
    "monto": 30,
    "metodo": "TARJETA",
    "estado": "APROBADO",
    "referencia": "REF-001",
    "ordenId": "UUID_DE_LA_ORDEN"
  }
}
```

Si se omite `estado`, el pago se crea como `PENDIENTE`.

## 6. Consultar datos por usuario y orden

### Pedidos de un usuario

```graphql
query PedidosDeUsuario($usuarioId: ID!) {
  pedidos(usuarioId: $usuarioId) {
    id
    producto
    subtotal
    orden {
      id
      total
    }
  }
}
```

Variables:

```json
{
  "usuarioId": "UUID_DEL_USUARIO"
}
```

### Pedidos de una orden

```graphql
query PedidosDeOrden($ordenId: ID!) {
  pedidos(ordenId: $ordenId) {
    id
    producto
    cantidad
    subtotal
  }
}
```

### Combinar ambos filtros

```graphql
query PedidosDeUsuarioEnOrden($usuarioId: ID!, $ordenId: ID!) {
  pedidos(usuarioId: $usuarioId, ordenId: $ordenId) {
    id
    producto
  }
}
```

### Pagos de una orden

```graphql
query PagosDeOrden($ordenId: ID!) {
  pagos(ordenId: $ordenId) {
    id
    monto
    metodo
    estado
  }
}
```

### Obtener todos los registros

```graphql
query Listados {
  usuarios {
    id
    nombre
    email
  }
  ordenes {
    id
    total
    usuario {
      id
    }
  }
  pedidos {
    id
    producto
  }
  pagos {
    id
    monto
  }
}
```

## 7. Consultar el usuario propietario

```graphql
query UsuarioPropietario($id: ID!) {
  usuario(id: $id) {
    id
    nombre
    email
    activo
    ordenes {
      id
      estado
      total
    }
    pedidos {
      id
      producto
    }
  }
}
```

## 8. Actualizar entidades

Las mutations de este ejemplo deben ejecutarse con ids existentes.

```graphql
mutation ActualizarEntidades(
  $usuarioId: ID!
  $ordenId: ID!
  $pedidoId: ID!
  $pagoId: ID!
) {
  actualizarUsuario(
    id: $usuarioId
    input: { nombre: "María Actualizada", telefono: null }
  ) {
    id
    nombre
    telefono
    activo
  }
  actualizarOrden(id: $ordenId, input: { estado: PAGADA }) {
    id
    estado
    total
  }
  actualizarPedido(
    id: $pedidoId
    input: { cantidad: 3, precioUnitario: 11.5 }
  ) {
    id
    cantidad
    precioUnitario
    subtotal
  }
  actualizarPago(
    id: $pagoId
    input: { estado: APROBADO, referencia: "REF-002" }
  ) {
    id
    estado
    referencia
  }
}
```

Variables:

```json
{
  "usuarioId": "UUID_DEL_USUARIO",
  "ordenId": "UUID_DE_LA_ORDEN",
  "pedidoId": "UUID_DEL_PEDIDO",
  "pagoId": "UUID_DEL_PAGO"
}
```

Actualizar cantidad, precio u orden recalcula los totales afectados.

## 9. Mover un pedido a otra orden del mismo propietario

Primero se crea otra orden para el mismo usuario:

```graphql
mutation CrearSegundaOrden($input: CrearOrdenInput!) {
  crearOrden(input: $input) {
    id
    total
  }
}
```

Después:

```graphql
mutation MoverPedido($pedidoId: ID!, $ordenId: ID!) {
  actualizarPedido(id: $pedidoId, input: { ordenId: $ordenId }) {
    id
    usuarioId
    ordenId
    subtotal
  }
}
```

Variables:

```json
{
  "pedidoId": "UUID_DEL_PEDIDO",
  "ordenId": "UUID_DE_LA_SEGUNDA_ORDEN"
}
```

No se puede mover un pedido a una orden cuyo propietario sea diferente.

## 10. Mover un pago

```graphql
mutation MoverPago($pagoId: ID!, $ordenId: ID!) {
  actualizarPago(id: $pagoId, input: { ordenId: $ordenId }) {
    id
    ordenId
    orden {
      id
      total
    }
  }
}
```

## 11. Eliminar en el orden correcto

Para eliminar una orden primero deben eliminarse sus pagos y pedidos.

```graphql
mutation LimpiarOrden(
  $ordenId: ID!
  $pagoId: ID!
  $pedidoUno: ID!
  $pedidoDos: ID!
) {
  eliminarPago(id: $pagoId)
  eliminarPedido(id: $pedidoUno)
  eliminarSegundoPedido: eliminarPedido(id: $pedidoDos)
  eliminarOrden(id: $ordenId)
}
```

Variables:

```json
{
  "ordenId": "UUID_DE_LA_ORDEN",
  "pagoId": "UUID_DEL_PAGO",
  "pedidoUno": "UUID_DEL_PEDIDO_UNO",
  "pedidoDos": "UUID_DEL_PEDIDO_DOS"
}
```

Finalmente, cuando el usuario no tenga pedidos ni órdenes:

```graphql
mutation EliminarUsuario($id: ID!) {
  eliminarUsuario(id: $id)
}
```

## 12. Errores esperados

### Usuario duplicado

Una segunda creación con el mismo email devuelve un error de conflicto.

### Pedido con propietario incorrecto

Si el `usuarioId` del pedido no coincide con el propietario de la orden, la operación se rechaza y no se crea ni modifica el pedido.

### Actualización con orden inexistente

Si `actualizarPedido` o `actualizarPago` reciben un `ordenId` inexistente, la entidad conserva todos sus valores anteriores.

### Eliminación con dependencias

- `eliminarUsuario` falla si existen pedidos u órdenes.
- `eliminarOrden` falla si existen pedidos o pagos.
- `eliminarPedido` actualiza el total de la orden.
- `eliminarPago` no modifica el total de la orden.
