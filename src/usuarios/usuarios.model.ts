import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { Orden } from '../ordenes/ordenes.model.js';
import { Pedido } from '../pedidos/pedidos.model.js';

@ObjectType({
  description: 'Usuario propietario de órdenes y creador de pedidos.',
})
export class Usuario {
  @Field(() => ID)
  id!: string;

  @Field()
  nombre!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  telefono?: string | null;

  @Field()
  activo!: boolean;

  @Field(() => [Pedido], { description: 'Pedidos creados por el usuario.' })
  pedidos!: Pedido[];

  @Field(() => [Orden], { description: 'Órdenes propiedad del usuario.' })
  ordenes!: Orden[];

  @Field(() => GraphQLISODateTime)
  creadoEn!: Date;

  @Field(() => GraphQLISODateTime)
  actualizadoEn!: Date;
}
