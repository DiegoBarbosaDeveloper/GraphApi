# WunderGraph Cosmo Router

API Gateway GraphQL para MrCatFood.

## Configuración

El router une 4 subgrafos:
- Usuarios (Java Spring Boot) - puerto 3001
- Ordenes (Java Spring Boot) - puerto 3002
- Pedidos (NestJS) - puerto 3003
- Pagos (Python Flask) - puerto 3004

## Uso

```bash
docker build -t cosmo-router .
docker run -p 3000:3000 cosmo-router
```

## Endpoint

- GraphQL: http://localhost:3000/graphql
- Health: http://localhost:3000/health
- Playground: http://localhost:3000/graphql (con navegador)
