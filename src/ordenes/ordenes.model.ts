import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Pedido } from '../pedidos/pedidos.model.js';
import { Pago } from '../pagos/pagos.model.js';
import { Usuario } from '../usuarios/usuarios.model.js';

export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

registerEnumType(EstadoOrden, {
  name: 'EstadoOrden',
  description: 'Estado actual del ciclo de vida de una orden.',
});

@ObjectType({ description: 'Orden que agrupa pedidos y sus pagos.' })
export class Orden {
  @Field(() => ID)
  id!: string;

  @Field(() => EstadoOrden)
  estado!: EstadoOrden;

  @Field(() => ID)
  usuarioId!: string;

  @Field(() => Usuario, { description: 'Usuario propietario de la orden.' })
  usuario?: Pick<Usuario, keyof Usuario>;

  @Field({ description: 'Suma de los subtotales de sus pedidos.' })
  total!: number;

  @Field(() => [Pedido], { description: 'Pedidos incluidos en la orden.' })
  pedidos!: Pedido[];

  @Field(() => [Pago], { description: 'Pagos asociados a la orden.' })
  pagos!: Pago[];

  @Field(() => GraphQLISODateTime)
  creadoEn!: Date;

  @Field(() => GraphQLISODateTime)
  actualizadoEn!: Date;
}
