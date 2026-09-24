import { Field, Float, ID, InputType, Int } from '@nestjs/graphql';
import { Transform, type TransformFnParams, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const eliminarEspacios = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

@InputType({ description: 'Datos necesarios para crear un pedido.' })
export class CrearPedidoInput {
  @Field()
  @Transform(eliminarEspacios)
  @IsString()
  @IsNotEmpty({ message: 'El producto no puede estar vacío.' })
  @MaxLength(160)
  producto!: string;

  @Field(() => String, { nullable: true })
  @Transform(eliminarEspacios)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string | null;

  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100_000)
  cantidad!: number;

  @Field(() => Float)
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 },
    {
      message: 'El precio unitario debe ser un número válido.',
    },
  )
  @IsPositive()
  @Max(100_000_000)
  precioUnitario!: number;

  @Field(() => ID)
  @IsUUID('4', {
    message: 'El usuario asociado no existe o tiene un id inválido.',
  })
  usuarioId!: string;

  @Field(() => ID)
  @IsUUID('4', {
    message: 'La orden asociada no existe o tiene un id inválido.',
  })
  ordenId!: string;
}

@InputType({ description: 'Campos que se pueden modificar en un pedido.' })
export class ActualizarPedidoInput {
  @Field({ nullable: true })
  @Transform(eliminarEspacios)
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'El producto no puede estar vacío.' })
  @MaxLength(160)
  producto?: string;

  @Field(() => String, { nullable: true })
  @Transform(eliminarEspacios)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string | null;

  @Field(() => Int, { nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100_000)
  cantidad?: number;

  @Field(() => Float, { nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 },
    {
      message: 'El precio unitario debe ser un número válido.',
    },
  )
  @IsPositive()
  @Max(100_000_000)
  precioUnitario?: number;

  @Field(() => ID, { nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsUUID('4', {
    message: 'El usuario asociado no existe o tiene un id inválido.',
  })
  usuarioId?: string;

  @Field(() => ID, { nullable: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsUUID('4', {
    message: 'La orden asociada no existe o tiene un id inválido.',
  })
  ordenId?: string;
}
