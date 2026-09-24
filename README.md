# MrCatFood API

API GraphQL **code-first** para gestionar usuarios, órdenes, pedidos y pagos. Está desarrollada con NestJS, TypeScript, Apollo Server y un almacenamiento temporal en memoria.

## Documentación

- [Referencia completa de la API](docs/API.md): tipos, consultas, mutaciones, validaciones y errores.
- [Ejemplos de uso](docs/EXAMPLES.md): flujo completo de creación, consulta, actualización y eliminación.
- [Arquitectura](docs/ARCHITECTURE.md): módulos, servicios, relaciones, almacenamiento y flujo de una petición.
- [Esquema GraphQL SDL](docs/schema.gql): contrato generado desde el código.

El esquema SDL puede regenerarse después de cambiar modelos o resolvers:

```bash
pnpm schema:generate
```

## Alcance actual

Decisiones deliberadas del MVP:

- Sin autenticación ni autorización.
- Con almacenamiento en memoria.
- Sin paginación.
- Sin reglas automáticas de transición de estados.
- Los pagos no están limitados automáticamente al total de la orden.
- Los datos se reinician cuando se detiene el servidor.

En este MVP, **Pedido** representa una línea de producto incluida dentro de una orden.

## Modelo de datos

- Un **Usuario** puede tener muchas órdenes y muchos pedidos.
- Cada **Orden** tiene un único usuario propietario.
- Una **Orden** contiene muchos pedidos y pagos.
- Cada pedido pertenece al mismo usuario que es propietario de su orden.
- El total de una orden se calcula con los subtotales de sus pedidos.

```text
Usuario 1 ─── N Orden 1 ─── N Pedido
Usuario 1 ─── N Pedido
Orden  1 ─── N Pago
```

## Requisitos y ejecución

```bash
pnpm install
pnpm start:dev
```

Endpoints:

- GraphQL y GraphiQL: `http://localhost:3000/graphql`
- Endpoint auxiliar de NestJS: `GET http://localhost:3000/`, que devuelve `Hello World!`.

Toda la API de usuarios, órdenes, pedidos y pagos se expone exclusivamente mediante `/graphql`.

GraphiQL se habilita fuera del modo de producción. Para cambiar el puerto:

```bash
PORT=4000 pnpm start:dev
```

Para ejecutar el JavaScript compilado en modo de producción:

```bash
pnpm build
pnpm start:prod
```

`start:prod` deshabilita GraphiQL, introspection y trazas de pila en las respuestas de error.

## Resumen de operaciones

| Entidad  | Consultas                                   | Mutaciones                                             |
| -------- | ------------------------------------------- | ------------------------------------------------------ |
| Usuarios | `usuarios`, `usuario(id)`                   | `crearUsuario`, `actualizarUsuario`, `eliminarUsuario` |
| Pedidos  | `pedidos(usuarioId, ordenId)`, `pedido(id)` | `crearPedido`, `actualizarPedido`, `eliminarPedido`    |
| Órdenes  | `ordenes`, `orden(id)`                      | `crearOrden`, `actualizarOrden`, `eliminarOrden`       |
| Pagos    | `pagos(ordenId)`, `pago(id)`                | `crearPago`, `actualizarPago`, `eliminarPago`          |

Los filtros de `pedidos` y `pagos` son opcionales. Omitirlos o enviar `null` equivale a no filtrar.

## Ejemplo mínimo

```graphql
mutation CrearFlujo {
  crearUsuario(input: { nombre: "María", email: "maria@example.com" }) {
    id
  }
}
```

Después se utiliza el id devuelto para crear una orden:

```graphql
mutation CrearOrden {
  crearOrden(input: { usuarioId: "UUID_DEL_USUARIO" }) {
    id
    estado
    total
  }
}
```

Los flujos completos están en [docs/EXAMPLES.md](docs/EXAMPLES.md).

## Reglas principales

- Todos los identificadores son UUID v4.
- El email es único y se almacena en minúsculas.
- Los textos obligatorios no pueden estar vacíos ni contener solo espacios.
- Una orden requiere un propietario existente.
- El propietario de una orden es inmutable después de crearla.
- Un pedido debe pertenecer al propietario de su orden.
- Las relaciones se validan antes de aplicar una actualización.
- El subtotal es `cantidad × precioUnitario`.
- El total se redondea a dos decimales.
- El total se recalcula al crear, actualizar, mover o eliminar pedidos.
- No se puede eliminar un usuario con pedidos u órdenes.
- No se puede eliminar una orden con pedidos o pagos.

La referencia completa está en [docs/API.md](docs/API.md).

## Estructura principal

```text
src/
├── graphql/          # Configuración y resolvers
├── usuarios/         # Modelo, input, servicio y módulo
├── ordenes/          # Modelo, input, servicio y módulo
├── pedidos/          # Modelo, input, servicio y módulo
├── pagos/            # Modelo, input, servicio y módulo
├── store/            # Almacenamiento en memoria
├── app.module.ts
├── app.setup.ts
└── main.ts
test/                 # Pruebas end-to-end de GraphQL
scripts/              # Generador del esquema SDL
docs/                 # Documentación y esquema generado
```

## Comandos de calidad

```bash
pnpm format           # Formato con Prettier
pnpm typecheck        # Typecheck de src, test y configuración
pnpm lint             # Análisis estático con Oxlint
pnpm test             # Pruebas unitarias
pnpm test:e2e         # Pruebas end-to-end de GraphQL
pnpm build            # Compilación
pnpm schema:generate  # Regenera docs/schema.gql
pnpm peers check      # Comprueba peer dependencies
```
