import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { EstadoOrden } from './ordenes.model.js';

@InputType({ description: 'Datos necesarios para crear una orden.' })
export class CrearOrdenInput {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El propietario de la orden no existe o tiene un id inválido.',
  })
  usuarioId!: string;

  @Field(() => EstadoOrden, { nullable: true })
  @IsOptional()
  @IsEnum(EstadoOrden)
  estado?: EstadoOrden;
}

@InputType({ description: 'Campos que se pueden modificar en una orden.' })
export class ActualizarOrdenInput {
  @Field(() => EstadoOrden, { nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(EstadoOrden)
  estado?: EstadoOrden;
}
