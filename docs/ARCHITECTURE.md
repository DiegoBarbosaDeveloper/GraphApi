# Arquitectura

## Resumen

MrCatFood es una API NestJS organizada en cuatro módulos de dominio y una capa GraphQL:

- `UsuariosModule`
- `OrdenesModule`
- `PedidosModule`
- `PagosModule`
- `StoreModule`
- `GraphqlModule`

El proyecto utiliza NestJS con TypeScript en modo ESM y Apollo Server como driver GraphQL. El esquema se construye con decorators `code-first`; no existe un archivo SDL mantenido manualmente durante el desarrollo.

## Capas

### GraphQL

`src/graphql/`

- Configura Apollo y el endpoint `/graphql`.
- Habilita GraphiQL fuera de producción.
- Declara queries, mutations y resolvers de relaciones.
- Desactiva GraphiQL, introspection y trazas de pila en producción.

### Dominio

Cada módulo de dominio contiene:

- `*.model.ts`: tipos GraphQL de salida y enums.
- `*.input.ts`: tipos GraphQL de entrada y validación.
- `*.service.ts`: reglas de negocio y acceso al almacenamiento.
- `*.module.ts`: registro de providers y exports.

Los módulos no importan controllers REST. Toda la API de negocio se expone mediante GraphQL.

### Almacenamiento

`src/store/`

- `InMemoryStoreService` mantiene cuatro `Map`.
- El servicio es singleton dentro del contenedor de NestJS.
- No hay conexiones, migraciones ni transacciones de base de datos.
- Al reiniciar la aplicación se pierde todo el contenido.

```ts
usuarios: Map<string, Usuario>;
ordenes: Map<string, Orden>;
pedidos: Map<string, Pedido>;
pagos: Map<string, Pago>;
```

### Configuración de la aplicación

- `src/main.ts`: crea y arranca NestJS.
- `src/app.module.ts`: registra GraphQL y los módulos de dominio.
- `src/app.setup.ts`: instala `ValidationPipe` global.

## Dependencias entre módulos

```text
AppModule
└── GraphqlModule
    ├── GraphQLModule.forRoot(...)
    ├── UsuariosModule
    │   └── StoreModule
    ├── OrdenesModule
    │   └── StoreModule
    ├── PedidosModule
    │   └── StoreModule
    └── PagosModule
        └── StoreModule
```

Los cuatro servicios reciben la misma instancia de `InMemoryStoreService`. Así pueden validar y consultar relaciones sin dependencias circulares entre servicios.

## Flujo de una petición

1. Express recibe `POST /graphql`.
2. Apollo valida la consulta contra el esquema.
3. Nest ejecuta el resolver correspondiente.
4. El resolver delega la operación en el servicio de dominio.
5. El servicio valida entradas y relaciones.
6. El servicio modifica el `Map` correspondiente.
7. Los resolvers de relaciones cargan datos mediante `@ResolveField`.
8. Apollo construye la respuesta GraphQL.

Ejemplo para `orden.pedidos`:

```text
OrdenesResolver.orden(id)
  └── OrdenesService.findOne(id)
      └── InMemoryStoreService.ordenes

OrdenesResolver.pedidos(orden)
  └── PedidosService.findByOrden(orden.id)
      └── InMemoryStoreService.pedidos
```

## Relaciones

```text
Usuario 1 ─── N Orden
Usuario 1 ─── N Pedido
Orden  1 ─── N Pedido
Orden  1 ─── N Pago
```

Reglas:

- Una orden siempre tiene `usuarioId`.
- El usuario de un pedido debe coincidir con el propietario de su orden.
- Un pago siempre referencia una orden existente.
- No se elimina un usuario que sea propietario de órdenes o tenga pedidos.
- No se elimina una orden que tenga pedidos o pagos.

## Resolución de relaciones

Los tipos GraphQL son no nulos para las relaciones:

```graphql
orden.usuario: Usuario!
orden.pedidos: [Pedido!]!
orden.pagos: [Pago!]!
pedido.usuario: Usuario!
pedido.orden: Orden!
pago.orden: Orden!
usuario.pedidos: [Pedido!]!
usuario.ordenes: [Orden!]!
```

Para mantener los modelos desacoplados del almacenamiento y resolver las relaciones bajo demanda, estas relaciones se implementan con `@ResolveField`. Los servicios exponen métodos como:

- `findByUsuario`
- `findByOrden`
- `findOne`

## Integridad y actualizaciones atómicas

Las actualizaciones validan primero cualquier relación nueva:

```text
PedidosService.update
  1. Localizar pedido.
  2. Normalizar textos.
  3. Validar usuario, si cambió.
  4. Validar orden, si cambió.
  5. Validar que usuario y orden sean compatibles.
  6. Aplicar cambios.
  7. Recalcular totales afectados.
```

`PagosService.update` sigue el mismo principio para `ordenId`.

Este orden evita que una validación fallida deje una entidad parcialmente modificada.

## Cálculo de totales

El servicio de pedidos mantiene el total de cada orden:

```text
subtotal = round(cantidad * precioUnitario, 2)
total = round(sum(pedidos.subtotal), 2)
```

Si un pedido cambia de orden, se recalculan:

- La orden de origen.
- La orden de destino.

## Validación

`ValidationPipe` se registra globalmente con:

- `transform: true`
- `whitelist: true`
- `forbidNonWhitelisted: true`

`class-validator` valida tipos, rangos, emails y UUID v4. `class-transformer` transforma números y normaliza textos antes de la validación.

## GraphQL y ESM

Los modelos forman ciclos lógicos: Usuario, Orden y Pedido se referencian entre sí. Para que el JavaScript emitido con ESM pueda inicializarse en Node.js sin acceder a una clase todavía no declarada, las relaciones escalares usan tipos estructurales como:

```ts
Pick<Usuario, keyof Usuario>;
Pick<Orden, keyof Orden>;
```

El tipo exacto se conserva para TypeScript y el campo GraphQL declara el tipo no nulo correcto. El smoke test de producción arranca `dist/main` para detectar problemas de metadata que Vite podría ocultar durante los tests.

## Modo desarrollo

- GraphiQL habilitado.
- Introspection habilitada.
- Trazas de pila habilitadas en respuestas de error.

## Modo producción

`pnpm start:prod` activa el modo de producción mediante `npm_lifecycle_event` o `NODE_ENV=production`.

En producción:

- GraphiQL deshabilitado.
- Introspection deshabilitada.
- Trazas de pila deshabilitadas.

## Sustitución del almacenamiento

Para migrar a una base de datos sin cambiar el contrato GraphQL:

1. Sustituir `InMemoryStoreService` por repositorios o servicios de persistencia.
2. Añadir entidades y migraciones.
3. Añadir transacciones para operaciones que modifiquen varias tablas.
4. Conservar las validaciones de los servicios de dominio.
5. Mantener resolvers y modelos GraphQL.
6. Añadir índices y claves foráneas para `usuarioId` y `ordenId`.

La base de datos real deberá reforzar:

- `Orden.usuarioId` como clave foránea.
- `Pedido.usuarioId` como clave foránea.
- `Pedido.ordenId` como clave foránea.
- `Pago.ordenId` como clave foránea.
- Una restricción que impida combinar un pedido con una orden de otro propietario.

## Pruebas

### Unitarias

`src/store/integrity.service.spec.ts` comprueba:

- Atomicidad de actualizaciones.
- Integridad entre usuario, orden y pedido.
- Recálculo de órdenes al mover un pedido.
- Protección de usuarios propietarios.

### End-to-end

`test/app.e2e-spec.ts` comprueba:

- GraphiQL.
- CRUD completo.
- Relaciones anidadas.
- Filtros opcionales.
- Validaciones.
- Errores de conflicto y eliminación.
- Recálculo de totales.
