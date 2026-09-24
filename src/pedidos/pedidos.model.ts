import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Orden } from '../ordenes/ordenes.model.js';
import { Usuario } from '../usuarios/usuarios.model.js';

@ObjectType({
  description:
    'Línea de producto incluida en una orden y creada por un usuario.',
})
export class Pedido {
  @Field(() => ID)
  id!: string;

  @Field()
  producto!: string;

  @Field(() => String, { nullable: true })
  descripcion?: string | null;

  @Field(() => Int)
  cantidad!: number;

  @Field()
  precioUnitario!: number;

  @Field({ description: 'Cantidad multiplicada por el precio unitario.' })
  subtotal!: number;

  @Field(() => ID)
  usuarioId!: string;

  @Field(() => Usuario)
  usuario?: Pick<Usuario, keyof Usuario>;

  @Field(() => ID)
  ordenId!: string;

  @Field(() => Orden)
  orden?: Pick<Orden, keyof Orden>;

  @Field(() => GraphQLISODateTime)
  creadoEn!: Date;

  @Field(() => GraphQLISODateTime)
  actualizadoEn!: Date;
}
