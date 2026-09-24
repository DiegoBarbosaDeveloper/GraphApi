import { Field, ID, InputType } from '@nestjs/graphql';
import { Transform, type TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { EstadoPago, MetodoPago } from './pagos.model.js';

const eliminarEspacios = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

@InputType({ description: 'Datos necesarios para crear un pago.' })
export class CrearPagoInput {
  @Field()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 },
    { message: 'El monto debe ser un número válido.' },
  )
  @IsPositive()
  @Max(100_000_000)
  monto!: number;

  @Field(() => MetodoPago)
  @IsEnum(MetodoPago)
  metodo!: MetodoPago;

  @Field(() => EstadoPago, { nullable: true })
  @IsOptional()
  @IsEnum(EstadoPago)
  estado?: EstadoPago;

  @Field(() => String, { nullable: true })
  @Transform(eliminarEspacios)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  referencia?: string | null;

  @Field(() => ID)
  @IsUUID('4', {
    message: 'La orden de pago no existe o tiene un id inválido.',
  })
  ordenId!: string;
}

@InputType({ description: 'Campos que se pueden modificar en un pago.' })
export class ActualizarPagoInput {
  @Field({ nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 },
    { message: 'El monto debe ser un número válido.' },
  )
  @IsPositive()
  @Max(100_000_000)
  monto?: number;

  @Field(() => MetodoPago, { nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(MetodoPago)
  metodo?: MetodoPago;

  @Field(() => EstadoPago, { nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(EstadoPago)
  estado?: EstadoPago;

  @Field(() => String, { nullable: true })
  @Transform(eliminarEspacios)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  referencia?: string | null;

  @Field(() => ID, { nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsUUID('4', {
    message: 'La orden de pago no existe o tiene un id inválido.',
  })
  ordenId?: string;
}
