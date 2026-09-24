import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { printSchema } from 'graphql';
import { format } from 'prettier';
import { AppModule } from '../dist/app.module.js';

const app = await NestFactory.create(AppModule, { logger: false });
await app.init();

try {
  const { schema } = app.get(GraphQLSchemaHost);
  const destination = join(process.cwd(), 'docs', 'schema.gql');
  const contenido = await format(printSchema(schema), { parser: 'graphql' });

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, contenido, 'utf8');

  console.log(`Esquema GraphQL generado en ${destination}`);
} finally {
  await app.close();
}
