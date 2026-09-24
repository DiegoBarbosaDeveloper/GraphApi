import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Orden } from '../ordenes/ordenes.model.js';

export enum MetodoPago {
  TARJETA = 'TARJETA',
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  OTRO = 'OTRO',
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

registerEnumType(MetodoPago, {
  name: 'MetodoPago',
  description: 'Medio utilizado para realizar un pago.',
});

registerEnumType(EstadoPago, {
  name: 'EstadoPago',
  description: 'Estado actual de un pago.',
});

@ObjectType({ description: 'Pago asociado a una orden.' })
export class Pago {
  @Field(() => ID)
  id!: string;

  @Field()
  monto!: number;

  @Field(() => MetodoPago)
  metodo!: MetodoPago;

  @Field(() => EstadoPago)
  estado!: EstadoPago;

  @Field(() => String, { nullable: true })
  referencia?: string | null;

  @Field(() => ID)
  ordenId!: string;

  @Field(() => Orden)
  orden?: Pick<Orden, keyof Orden>;

  @Field(() => GraphQLISODateTime)
  creadoEn!: Date;

  @Field(() => GraphQLISODateTime)
  actualizadoEn!: Date;
}
